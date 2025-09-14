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
import { BillingCycle, PriceType, Prisma, RecurringInterval } from '@prisma/client';
import { UpdateProductDto, CreateProductDto, ProductResponseDto } from 'src/dtos/items.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly prisma: PrismaService,
    private stripeService: StripeService,
  ) { }

  async createProduct(data: CreateProductDto): Promise<ProductResponseDto> {
    const pricesInput = data.prices ?? [];
    const featuresInput = data.features ?? [];

    const defaultCount = pricesInput.filter(p => p.isDefault === true).length;
    if (defaultCount > 1) {
      throw new BadRequestException('Only one default price is allowed per product.');
    }

    const sanitizedFeatures = featuresInput.map(f => ({
      featureId: f.featureId,
      includedLimit: f.includedLimit,
      resetCycle: f.resetCycle,
    }));

    // --- Transaction start
    const created = await this.prisma.$transaction(async (tx) => {
      // 1) Set Stripe product ID (use if submitted; otherwise, create one in Stripe)
      const stripeProductId =
        data.stripeProductId ??
        (await this.stripeService.createProduct({
          name: data.name,
          description: JSON.stringify(data.description) ?? undefined,
        })).id;

      // 2) Create Local product
      const { prices, features, stripeProductId: _ignore, ...productData } = data as any;
      const localProduct = await tx.product.create({
        data: {
          ...productData,
          isActive: data.isActive ?? true,
          stripeProductId,
        },
      });

      for (const price of pricesInput) {
        const priceType = price.priceType ?? PriceType.one_time;

       // If stripePriceId is given, dont create it in Stripe
        const stripePriceId = price.stripePriceId
          ? price.stripePriceId
          : (
              await this.stripeService.createPrice({
                unit_amount: price.unit_amount,
                currency: price.currency,
                product: stripeProductId,
                recurring:
                  priceType === PriceType.recurring && price.recurring
                    ? {
                        interval: price.recurring.interval,
                        interval_count: price.recurring.interval_count,
                      }
                    : undefined,
              })
            ).id;

        const createdPrice = await tx.price.create({
          data: {
            product: { connect: { id: localProduct.id } },
            isDefault: price.isDefault ?? false,
            stripePriceId,
            name: price.name,
            description: price.description,
            unit_amount: price.unit_amount,
            currency: price.currency,
            priceType,
            additionalFees: price.additionalFees ?? 0,
            recurring:
              priceType === PriceType.recurring && price.recurring
                ? {
                    create: {
                      interval: price.recurring.interval,
                      interval_count: price.recurring.interval_count,
                    },
                  }
                : undefined,
          },
        });

        if (price.isDefault === true) {
          // update Stripe product default_price 
          await this.stripeService.updateProduct(stripeProductId, {
            default_price: stripePriceId,
          });

          // update local defaultPriceId 
          await tx.product.update({
            where: { id: localProduct.id },
            data: { defaultPriceId: createdPrice.id },
          });
        }
      }

      if (sanitizedFeatures.length > 0) {
        const validFeatureIds = new Set(
          (
            await tx.feature.findMany({
              where: { id: { in: sanitizedFeatures.map(f => f.featureId) } },
              select: { id: true },
            })
          ).map(f => f.id),
        );

        if (validFeatureIds.size !== sanitizedFeatures.length) {
          throw new BadRequestException('Some features are invalid or not found.');
        }
        await tx.productFeature.createMany({
          data: sanitizedFeatures.map((f) => ({
            productId: localProduct.id,
            featureId: f.featureId,
            includedLimit: f.includedLimit,
            resetCycle: f.resetCycle as unknown as BillingCycle,
            isActive: true,
            isDeleted: false,
          })),
        });
      }
      const enriched = await tx.product.findUnique({
        where: { id: localProduct.id },
        include: {
          prices: { include: { recurring: true } },
          productFeature: {
            include: { feature: true }
          },
        },
      });

      return enriched!;
    });
    // --- Transaction end

    this.logger.log(`Product created successfully: ${created.id}`);
    return created;
  }

  async updateProduct(productId: string, data: UpdateProductDto) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { prices: true },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (!product.stripeProductId) {
        throw new InternalServerErrorException('Stripe product ID not found');
      }

      const { prices, features, ...productData } = data;

      await this.prisma.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { ...productData },
        });

        let stripeData = {
          name: data.name,
          description:JSON.stringify(data.description) ?? undefined,
          images: data.imageUrl ? [data.imageUrl] : undefined,
        }
        await this.stripeService.updateProduct(product.stripeProductId, stripeData);

        if (features && features.length > 0) {
          for (const feature of features) {
            await tx.productFeature.update({
              where: { productId_featureId: { productId: productId, featureId: feature.featureId } },
              data: { 
                includedLimit: feature.includedLimit,
                resetCycle: feature.resetCycle as BillingCycle,
              },
            });
          }
        }

        return updatedProduct;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Product with this name already exists');
        }
      }
      this.logger.log('Error while updating product', error);
      throw new HttpException('Error while updating product', 500)
    }
  }

  async deleteProduct(productId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Ürünü öncelikle var mı diye kontrol et
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { prices: true },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      let stripeDeleted = false;

      // 2. Stripe tarafında ürünü sil/deactive et
      if (product.stripeProductId) {
        try {
          const stripeResult = await this.stripeService.deactiveProduct(product.stripeProductId);

          // Stripe'dan dönen response'u kontrol et
          // Eğer deleted: true varsa gerçekten silinmiş demektir
          if (stripeResult && (stripeResult as any).deleted === true) {
            stripeDeleted = true;
            console.log(`Product ${productId} successfully deleted from Stripe`);
          } else {
            console.log(`Product ${productId} deactivated on Stripe (could not be deleted)`);
          }
        } catch (error) {
          console.error(`Error processing Stripe product ${product.stripeProductId}:`, error);
          // Stripe hatası olsa bile database işlemlerine devam et
        }
      }
      // 3. Ürünle ilişkili subscription'ları sil (her durumda)
      await tx.subscriptionItem.deleteMany({
        where: { itemId: productId },
      });

      // 4. Stripe'dan gerçekten silindiyse database'den de sil
      if (stripeDeleted) {
        // Önce fiyatları sil
        if (product.prices && product.prices.length > 0) {
          await tx.price.deleteMany({
            where: { productId: productId },
          });
        }

        // Sonra ürünü sil
        await tx.product.delete({
          where: { id: productId },
        });

        return {
          deleted: true,
          message: 'Product successfully deleted from both Stripe and database',
          productId,
        };
      } else {
        // Stripe'dan silinemedi, sadece deactive et
        if (product.prices && product.prices.length > 0) {
          await tx.price.updateMany({
            where: { productId: productId },
            data: { active: false },
          });
        }

        const deactivatedProduct = await tx.product.update({
          where: { id: productId },
          data: { isActive: false },
        });

        return {
          deleted: false,
          deactivated: true,
          message: 'Product deactivated (could not be deleted from Stripe)',
          productId,
          product: deactivatedProduct,
        };
      }
    });
  }

  async findAddons(): Promise<ProductResponseDto[]> {
    return this.findByType('ADDON');
  }

  async findProducts(): Promise<ProductResponseDto[]> {
    return this.findByType('PRODUCT');
  }

  async findByType(type: string): Promise<ProductResponseDto[]> {
    return this.findAll(type, true);
  }

  async findAll(
    type?: string,
    isActive?: boolean,
  ): Promise<ProductResponseDto[]> {
    const where: Prisma.ProductWhereInput = {};
    
    if (type) where.type = type as any;
    if (isActive !== undefined) where.isActive = isActive;
    where.isDeleted = false;

    return this.prisma.product.findMany({
      where,
      include: {
        prices: {
          where: {
            isDeleted: false,
          },
          orderBy: {
            unit_amount: 'asc',
          },
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        prices: {
          where: {
            isDeleted: false,
          },
          include: {
            recurring: true,
          },
        },
        productFeature: {
          include: {
            feature: true,
          },
        },
        planAddon: {
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

    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }
}
