import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CreatePlanAddonDto, UpdatePlanAddonDto } from "src/dtos/plan_entitlements.dto";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class PlanAddonsService {
  private readonly logger = new Logger(PlanAddonsService.name);

  constructor(private readonly prisma: PrismaService) {}


  async assignProductToPlanAddon(data: CreatePlanAddonDto) {
  return await this.prisma.$transaction(async (tx) => {
    try {
      let productPrices = [];
    if (data.priceIds && data.priceIds.length > 0) {
      productPrices = await tx.price.findMany({
        where: { id: { in: data.priceIds } },
      });
    } else {
      productPrices = await tx.price.findMany({
        where: { productId: data.productId },
      });
      if (productPrices.length === 0) {
      throw new NotFoundException('No prices found for the specified product');
      }
    }
    const createdAddons = await Promise.all(
      productPrices.map((price) =>
        tx.planAddon.create({
          data: {
            planId: data.planId,
            productId: data.productId,
            productPriceId: price.id,
            displayOrder: data.displayOrder ?? 1,
          },
        })
      )
    );
    return createdAddons;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Addon already exists');
      }
      }
      this.logger.error(`Failed to assign product to plan addon: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to assign product to plan addon');
    }
  });
}

  async getPlanAddons(planId: string) {
    try {
      const addons = await this.prisma.planAddon.findMany({
        where: {
          planId,
          isActive: true,
          isDeleted: false,
        },
        include: {
          product: {
            include: {
              productFeature: {
                include: {
                  feature:true
                },
              },
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

  async updatePlanAddon(id: string, data: UpdatePlanAddonDto) {
    try {
      const existingAddon = await this.prisma.planAddon.findUnique({
        where: { id },
      });

      if (!existingAddon || existingAddon.isDeleted) {
        throw new NotFoundException('Plan addon not found');
      }

      return await this.prisma.planAddon.update({
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
      const existingAddon = await this.prisma.planAddon.findUnique({
        where: { id },
      });

      if (!existingAddon || existingAddon.isDeleted) {
        throw new NotFoundException('Plan addon not found');
      }

      return await this.prisma.planAddon.update({
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
    return await this.prisma.planAddon.updateMany({
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
}