import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { 
  CreatePriceDto, 
  UpdatePriceDto, 
  PriceResponseDto,
  ProductPriceDto,
  ProductResponseDto
} from 'src/dtos/product.dto';
import { Prisma, RecurringInterval } from '@prisma/client';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PriceService {
  constructor(private prisma: PrismaService,
    private stripeService: StripeService,

  ) {}

  async findAll(
    productId?: string,
    active?: boolean,
  ): Promise<PriceResponseDto[]> {
    const where: Prisma.PriceWhereInput = {};
    
    if (productId) where.productId = productId;
    if (active !== undefined) where.active = active;
    where.isDeleted = false;

    return this.prisma.price.findMany({
      where,
      include: {
        product: true,
        recurring: true,
        planAddons: {
          include: {
            plan: {
              include: {
                officeLocation: true,
              },
            },
          },
        },
      },
      orderBy: {
        unit_amount: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<PriceResponseDto> {
    const price = await this.prisma.price.findUnique({
      where: { id },
      include: {
        product: true,
        recurring: true,
        planAddons: {
          include: {
            plan: {
              include: {
                officeLocation: true,
              },
            },
          },
        },
      },
    });

    if (!price || price.isDeleted) {
      throw new NotFoundException(`Price with ID ${id} not found`);
    }

    return price;
  }

  async update(id: string, updatePriceDto: UpdatePriceDto): Promise<PriceResponseDto> {
    try {
      // If setting as default, unset other defaults for the same product
      if (updatePriceDto.isDefault) {
        const existingPrice = await this.prisma.price.findUnique({
          where: { id },
        });

        if (existingPrice) {
          await this.prisma.price.updateMany({
            where: {
              productId: existingPrice.productId,
              isDefault: true,
              id: { not: id },
            },
            data: {
              isDefault: false,
            },
          });
        }
      }

      const price = await this.prisma.price.update({
        where: { id },
        data: updatePriceDto,
        include: {
          product: true,
          recurring: true,
        },
      });

      return price;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Price with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.price.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          active: false,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Price with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async findByProduct(productId: string): Promise<PriceResponseDto[]> {
    return this.findAll(productId, true);
  }

  async findActivePrices(): Promise<PriceResponseDto[]> {
    return this.findAll(undefined, true);
  }

  async setAsDefault(id: string): Promise<PriceResponseDto> {
    const price = await this.findOne(id);
    
    // Unset other default prices for the same product
    await this.prisma.price.updateMany({
      where: {
        productId: price.productId,
        isDefault: true,
        id: { not: id },
      },
      data: {
        isDefault: false,
      },
    });

    // Set this price as default
    return this.update(id, { isDefault: true });
  }


  async createPrice(productId: string, priceData: ProductPriceDto): Promise<ProductResponseDto> {
    return await this.prisma.$transaction(async (tx) => {
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
                  interval: priceData.recurring.interval as RecurringInterval,
                  interval_count: priceData.recurring.interval_count,
                },
              }
            : undefined,
        },
      });
  
      if (priceData.isDefault) {
        await this.updateDefaultPrice(tx, product, stripePriceId, createdPrice.id);
      }
  
      return this.prisma.product.findUnique({
        where: { id: productId },
        include: { prices: { include: { recurring: true } } },
      });
    });
  }

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
  
  private async validateAndActivateStripePrice(stripePriceId: string, priceData: ProductPriceDto) {
    const price = await this.stripeService.getPrice(stripePriceId);
    if (!price) {
      throw new NotFoundException('Stripe Price bulunamadı. ID kontrol edin.');
    }
  
    if (!price.active) {
      await this.stripeService.updatePrice(stripePriceId, { active: true });
    }
  
    if (
      priceData.priceType === 'recurring' &&
      (!price.recurring ||
        price.recurring.interval !== priceData.recurring?.interval ||
        price.recurring.interval_count !== priceData.recurring?.interval_count)
    ) {
      throw new BadRequestException('Stripe Price ID ile gönderilen recurring bilgileri uyuşmuyor');
    }
  }
  
  private async createStripePrice(stripeProductId: string, priceData: ProductPriceDto) {
    return this.stripeService.createPrice({
      unit_amount: priceData.unit_amount,
      currency: priceData.currency,
      product: stripeProductId,
      recurring:
        priceData.priceType === 'recurring' && priceData.recurring
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