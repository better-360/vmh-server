import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarketService {
  private readonly logger = new Logger('MarketService');

  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  // =====================
  // PRODUCT OPERATIONS
  // =====================

  async getProducts(type?: string, isActive: boolean = true) {
    try {
      const where: Prisma.ProductWhereInput = {
        isDeleted: false,
      };

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (type) {
        where.type = type as any;
      }

      return await this.prismaService.product.findMany({
        where,
        include: {
          prices: {
            where: {
              isDeleted: false,
              active: true,
            },
            include: {
              recurring: {
                select: { interval: true, intervalCount: true },
              },
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
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to get products: ${error.message}`);
      throw new BadRequestException('Failed to get products');
    }
  }

  async getProductById(id: string) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: { id },
        include: {
          prices: {
            where: {
              isDeleted: false,
              active: true,
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
        throw new NotFoundException('Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get product by ID: ${error.message}`);
      throw new BadRequestException('Failed to get product');
    }
  }

  async getAddonProducts() {
    return this.getProducts('ADDON', true);
  }

  async getStandaloneProducts() {
    return this.getProducts('PRODUCT', true);
  }

  // =====================
  // PLAN ADDON OPERATIONS
  // =====================

  async assignProductToPlanAddon(data: {
    planId: string;
    productId: string;
    productPriceId: string;
    displayOrder?: number;
  }) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // Verify plan and product exist
        const [plan, product, price] = await Promise.all([
          tx.plan.findUnique({ where: { id: data.planId } }),
          tx.product.findUnique({ where: { id: data.productId } }),
          tx.price.findUnique({ where: { id: data.productPriceId } }),
        ]);

        if (!plan || plan.isDeleted) {
          throw new NotFoundException('Plan not found');
        }

        if (!product || product.isDeleted) {
          throw new NotFoundException('Product not found');
        }

        if (!price || price.isDeleted) {
          throw new NotFoundException('Price not found');
        }

        // Check if addon already exists for this plan
        const existingAddon = await tx.planAddon.findFirst({
          where: {
            planId: data.planId,
            productId: data.productId,
            isDeleted: false,
          },
        });

        if (existingAddon) {
          throw new BadRequestException('Product is already added to this plan');
        }

        // Create the plan addon
        const createdAddon = await tx.planAddon.create({
          data: {
            planId: data.planId,
            productId: data.productId,
            productPriceId: data.productPriceId,
            displayOrder: data.displayOrder ?? 1,
          },
          include: {
            plan: true,
            product: {
              include: {
                prices: true,
              },
            },
            prices: {
              include: {
                recurring: true,
              },
            },
          },
        });

        return createdAddon;
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to assign product to plan addon: ${error.message}`);
      throw new BadRequestException('Failed to assign product to plan addon');
    }
  }

  async getPlanAddons(planId: string) {
    try {
      const addons = await this.prismaService.planAddon.findMany({
        where: {
          planId,
          isActive: true,
          isDeleted: false,
        },
        include: {
          product: {
            include: {
              prices: {
                where: {
                  isDeleted: false,
                  active: true,
                },
                include: {
                  recurring: true,
                },
              },
            },
          },
          prices: {
            include: {
              recurring: true,
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });

      // Group addons by product to get all prices for each product
      const groupedAddons = addons.reduce((acc, addon) => {
        const existingProduct = acc.find((p) => p.productId === addon.productId);

        const priceData = addon.prices
          ? {
              id: addon.prices.id,
              name: addon.prices.name,
              unit_amount: addon.prices.unit_amount,
              currency: addon.prices.currency,
              recurring: addon.prices.recurring,
              stripePriceId: addon.prices.stripePriceId,
              isDefault: addon.prices.isDefault,
            }
          : null;

        if (existingProduct) {
          if (priceData) existingProduct.prices.push(priceData);
        } else {
          acc.push({
            id: addon.id,
            productId: addon.productId,
            productName: addon.product.name,
            description: addon.product.description,
            stripeProductId: addon.product.stripeProductId,
            type: addon.product.type,
            imageUrl: addon.product.imageUrl,
            prices: priceData ? [priceData] : [],
            displayOrder: addon.displayOrder,
          });
        }

        return acc;
      }, []);

      return groupedAddons;
    } catch (error) {
      this.logger.error(`Failed to get plan addons: ${error.message}`);
      throw new BadRequestException('Failed to get plan addons');
    }
  }

  async updatePlanAddon(id: string, data: { displayOrder?: number; isActive?: boolean }) {
    try {
      const existingAddon = await this.prismaService.planAddon.findUnique({
        where: { id },
      });

      if (!existingAddon || existingAddon.isDeleted) {
        throw new NotFoundException('Plan addon not found');
      }

      return await this.prismaService.planAddon.update({
        where: { id },
        data,
        include: {
          product: true,
          plan: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update plan addon: ${error.message}`);
      throw new BadRequestException('Failed to update plan addon');
    }
  }

  async removePlanAddon(id: string) {
    try {
      const existingAddon = await this.prismaService.planAddon.findUnique({
        where: { id },
      });

      if (!existingAddon || existingAddon.isDeleted) {
        throw new NotFoundException('Plan addon not found');
      }

      return await this.prismaService.planAddon.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to remove plan addon: ${error.message}`);
      throw new BadRequestException('Failed to remove plan addon');
    }
  }

  async removeAllPlanAddons(planId: string) {
    try {
      return await this.prismaService.planAddon.updateMany({
        where: {
          planId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to remove all plan addons: ${error.message}`);
      throw new BadRequestException('Failed to remove all plan addons');
    }
  }

  // =====================
  // MARKETPLACE OPERATIONS
  // =====================

  async getMarketplaceProducts(officeLocationId?: string) {
    try {
      const where: Prisma.ProductWhereInput = {
        isActive: true,
        isDeleted: false,
        type: 'PRODUCT',
      };

      return await this.prismaService.product.findMany({
        where,
        include: {
          prices: {
            where: {
              active: true,
              isDeleted: false,
            },
            include: {
              recurring: true,
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
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get marketplace products: ${error.message}`);
      throw new BadRequestException('Failed to get marketplace products');
    }
  }

  async getMarketplaceAddons(officeLocationId?: string) {
    try {
      return await this.getProducts('ADDON', true);
    } catch (error) {
      this.logger.error(`Failed to get marketplace addons: ${error.message}`);
      throw new BadRequestException('Failed to get marketplace addons');
    }
  }
}