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
    return await this.prisma.$transaction(async (tx) => {
      // 1. Stripe üzerinde ürün oluştur.
      const stripeProduct = await this.stripeService.createProduct({
        name: data.name,
        description: data.description,
      });

      // 2. Ürün oluşturulurken "prices" alanını veriden çıkartıyoruz.
      const { prices, features, ...productData } = data;
      const localProduct = await tx.product.create({
        data: { ...productData, stripeProductId: stripeProduct.id },
      });

      // 3. Her fiyat için asenkron işlemleri await eden bir döngü kullanıyoruz.
      if (prices && prices.length > 0) {
        for (const price of prices) {
          // Recurring kontrolü: Eğer fiyat tipi recurring ise recurring bilgisi olmalı.
          if (price.priceType === PriceType.recurring && !price.recurring) {
            throw new Error(
              'Recurring fiyatlar için recurring bilgisi gereklidir',
            );
          }

          // 4. Stripe üzerinde fiyat oluştur.
          const stripePrice = await this.stripeService.createPrice({
            unit_amount: price.unit_amount,
            currency: price.currency,
            product: localProduct.stripeProductId,
            recurring:
              price.priceType === PriceType.recurring && price.recurring
                ? {
                  interval: price.recurring.interval as RecurringInterval,
                  interval_count: price.recurring.interval_count,
                }
                : undefined,
          });

          // 5. Veritabanına ürün fiyatı kaydını oluştur.
          const createdPrice = await tx.price.create({
            data: {
              product: { connect: { id: localProduct.id } },
              isDefault: price.isDefault ?? false,
              stripePriceId: stripePrice.id,
              name: price.name,
              description: price.description,
              unit_amount: price.unit_amount,
              currency: price.currency,
              priceType: price.priceType,
              recurring: price.recurring
                ? {
                  create: {
                    interval: price.recurring.interval as RecurringInterval,
                    interval_count: price.recurring.interval_count,
                  },
                }
                : undefined,
            },
          });

          // 6. Eğer fiyat default ise, Stripe ürününü ve veritabanındaki defaultPrice'ı güncelle.
          if (price.isDefault) {
            await this.stripeService.updateProduct(
              localProduct.stripeProductId,
              {
                default_price: stripePrice.id,
              },
            );
            await tx.product.update({
              where: { id: localProduct.id },
              data: { defaultPriceId: createdPrice.id },
            });
          }
        }
      }

      if (features && features.length > 0) {
        for (const feature of features) {
          await tx.productFeature.create({
            data: { 
              product: { connect: { id: localProduct.id } },
              feature: { connect: { id: feature.featureId } },
              includedLimit: feature.includedLimit,
              resetCycle: feature.resetCycle as BillingCycle,
            },
          });
        }
      }

      // 7. Oluşturulan ürünü, fiyat bilgileriyle birlikte getir.
      const pricedProduct = await this.prisma.product.findUnique({
        where: { id: localProduct.id },
        include: { prices: { include: { recurring: true } } },
      });
      return pricedProduct;
    });
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
          description: data.description,
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
        },
        productFeature: {
          include: {
            feature: true,
          },
        },
        planAddon: {
          include: {
            plan: true,
          },
        },
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
