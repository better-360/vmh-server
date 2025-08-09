import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { PriceType, Prisma, Product, ProductType, RecurringInterval } from '@prisma/client';
import { UpdateProductDto, CreatePriceDto,CreateProductDto, ProductResponseDto, PriceResponseDto } from 'src/dtos/items.dto';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private stripeService: StripeService,
  ) { }


  async createPrice(productId: string, priceData: CreatePriceDto) {
    return await this.prismaService.$transaction(async (tx) => {
      const product = await this.findProductOrThrow(tx, productId);
  
      const stripeProduct = await this.stripeService.getProduct(product.stripeProductId);
      if (!stripeProduct) {
        throw new InternalServerErrorException("Stripe product not found, please check Stripe product ID");
      }
  
      if (priceData.priceType === 'recurring' && !priceData.recurring) {
        throw new BadRequestException('Recurring information is required for recurring prices.');
      }
  
      if (priceData.isDefault) {
        await this.unsetCurrentDefaultPrice(tx, product.id);
      }
  
      let stripePriceId = priceData.stripePriceId;
      if (stripePriceId) {
        await this.validateAndActivateStripePrice(stripePriceId, priceData);
      } else {
        const createdStripePrice = await this.createStripePrice(product.stripeProductId, priceData);
        stripePriceId = createdStripePrice.id;
      }
  
      const createdPrice = await tx.price.create({
        data: {
          product: { connect: { id: product.id } },
          isDefault: priceData.isDefault ?? false,
          stripePriceId,
          name: priceData.name,
          description: priceData.description,
          unit_amount: priceData.unit_amount,
          currency: priceData.currency,
          priceType: priceData.priceType,
          recurring: priceData.recurring
            ? {
                create: {
                  interval: priceData.recurring.interval,
                  interval_count: priceData.recurring.interval_count,
                },
              }
            : undefined,
        },
      });
  
      if (priceData.isDefault) {
        await this.updateDefaultPrice(tx, product, stripePriceId, createdPrice.id);
      }
  
      return this.prismaService.product.findUnique({
        where: { id: productId },
        include: { prices: { include: { recurring: true } } },
      });
    });
  }

  async deletePrice(priceId: string) {
    try {
      const price = await this.prismaService.price.findUnique({
        where: { id: priceId },
        include: {
          product: {
            include: {
              prices: { where: { active: true } }
            }
          }
        },
      });

      if (!price) {
        throw new NotFoundException('Product price not found');
      }

      await this.stripeService.deactivePrice(price.stripePriceId);

      // Set active to false
      const updatedPrice = await this.prismaService.price.update({
        where: { id: priceId },
        data: { active: false },
      });

      // If this price is default price and there are other active prices, set one of them as default
      if (price.isDefault) {
        const otherActivePrices = price.product.prices.filter(
          p => p.id !== priceId && p.active
        );

        if (otherActivePrices.length > 0) {
          const newDefaultPrice = otherActivePrices[0];
          await this.prismaService.$transaction(async (tx) => {
            await tx.price.update({
              where: { id: priceId },
              data: { isDefault: false },
            });
            await tx.price.update({
              where: { id: newDefaultPrice.id },
              data: { isDefault: true },
            });
            await tx.product.update({
              where: { id: price.product.id },
              data: { defaultPriceId: newDefaultPrice.id },
            });
          });
          this.logger.log(`New default price set: ${newDefaultPrice.id} for product: ${price.product.id}`);
        } else {
          await this.prismaService.product.update({
            where: { id: price.product.id },
            data: { defaultPriceId: null },
          });
          this.logger.log(`No active prices left for product: ${price.product.id}, removed default price reference`);
        }
      }
      this.logger.log(`Successfully deleted product price: ${priceId}`);
      return updatedPrice;
    } catch (error) {
      this.logger.error(
        `Error deleting product price: ${error.message}`,
        error.stack,
      );
      if (error.message && error.message.includes('default price')) {
        throw new InternalServerErrorException(
          'This price is the default price of the product. The system automatically tries to set another price as default.'
        );
      }
      throw new InternalServerErrorException(`Failed to delete product price: ${error.message}`);
    }
  }

  async setAsDefault(priceId: string) {
    try {
      const price = await this.prismaService.price.findUnique({
        where: { id: priceId },
        include: { product: true },
      });

      if (!price) {
        throw new NotFoundException('Product price not found');
      }

      if (!price.active) {
        throw new BadRequestException('Cannot set inactive price as default');
      }

      return await this.prismaService.$transaction(async (tx) => {
        await tx.price.updateMany({
          where: {
            productId: price.productId,
            active: true
          },
          data: { isDefault: false },
        });
        await tx.price.update({
          where: { id: priceId },
          data: { isDefault: true },
        }); 
        await tx.product.update({
          where: { id: price.productId },
          data: { defaultPriceId: priceId },
        });

        await this.stripeService.setDefaultPrice(price.stripePriceId, price.product.stripeProductId);

        this.logger.log(`Default price set successfully: ${priceId} for product: ${price.productId}`);

        return {
          success: true,
          message: 'Default price updated successfully',
          defaultPriceId: priceId,
        };
      });

    } catch (error) {
      this.logger.error(`Error setting default price: ${error.message}`,error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to set default price: ${error.message}`);
    }
  }

  async findAllPrices(
    productId?: string,
    active?: boolean,
  ): Promise<PriceResponseDto[]> {
    const where: Prisma.PriceWhereInput = {};
    
    if (productId) where.productId = productId;
    if (active !== undefined) where.active = active;
    where.isDeleted = false;

    return this.prismaService.price.findMany({
      where,
      include: {
        product: true,
        recurring: true,
      },
      orderBy: {
        unit_amount: 'asc',
      },
    });
  }

  async findPriceById(id: string): Promise<PriceResponseDto> {
    const price = await this.prismaService.price.findUnique({
      where: { id },
      include: {
        product: true,
        recurring: true,
      },
    });

    if (!price || price.isDeleted) {
      throw new NotFoundException(`Price with ID ${id} not found`);
    }

    return price;
  }


  // =====================
  // HELPER METHODS
  // =====================


private async unsetCurrentDefaultPrice(tx: Prisma.TransactionClient, productId: string) {
  await tx.price.updateMany({
    where: { productId, isDefault: true },
    data: { isDefault: false },
  });
}

private async findProductOrThrow(tx: Prisma.TransactionClient, productId: string) {
  const product = await tx.product.findUnique({
    where: { id: productId },
    include: { prices: true },
  });
  if (!product) throw new NotFoundException('Product not found');
  return product;
}

private async validateAndActivateStripePrice(stripePriceId: string, priceData: CreatePriceDto) {
  const price = await this.stripeService.getPrice(stripePriceId);
  if (!price) {
    throw new NotFoundException('Stripe Price bulunamadı. ID kontrol edin.');
  }

  if (!price.active) {
    await this.stripeService.updatePrice(stripePriceId, { active: true });
  }
  if (
    priceData.priceType === PriceType.recurring &&
    (!price.recurring ||
      price.recurring.interval !== priceData.recurring?.interval ||
      price.recurring.interval_count !== priceData.recurring?.interval_count)
  ) {
    throw new BadRequestException('Stripe Price ID and recurring information do not match');
  }
}

private async createStripePrice(stripeProductId: string, priceData: CreatePriceDto) {
  return this.stripeService.createPrice({
    unit_amount: priceData.unit_amount,
    currency: priceData.currency,
    product: stripeProductId,
    recurring:
      priceData.priceType === PriceType.recurring && priceData.recurring
        ? {
            interval: priceData.recurring.interval as RecurringInterval,
            interval_count: priceData.recurring.interval_count,
          }
        : undefined,
  });
}

private async updateDefaultPrice(tx: Prisma.TransactionClient, product: any, stripePriceId: string, dbPriceId: string) {
  await this.stripeService.updateProduct(product.stripeProductId, {
    default_price: stripePriceId,
  });
  await tx.product.update({
    where: { id: product.id },
    data: { defaultPriceId: dbPriceId },
  });
}
}