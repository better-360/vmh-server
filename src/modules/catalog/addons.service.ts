import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateAddonDto,
  UpdateAddonDto,
  AddonQueryDto,
  CreateAddonVariantDto,
  UpdateAddonVariantDto,
  AddonVariantQueryDto,
  CreatePlanAddonDto,
  UpdatePlanAddonDto,
  PlanAddonQueryDto,
  CreateAddonWithVariantsDto,
  BulkCreatePlanAddonsDto,
  BulkUpdatePlanAddonsDto,
} from 'src/dtos/addons.dto';

@Injectable()
export class AddonsService {
  private readonly logger = new Logger('AddonsService');

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // ADDON OPERATIONS
  // =====================

  /**
   * Get addons with pagination and filtering
   */
  async getAddons(query?: AddonQueryDto) {
    const {
      isActive,
      isDeleted = false,
      search,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.AddonWhereInput = {
      isDeleted,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [addons, total] = await Promise.all([
      this.prisma.addon.findMany({
        where,
        skip,
        take: limit,
        include: {
          variants: {
            where: { isDeleted: false },
            orderBy: { price: 'asc' },
          },
          planAddons: {
            where: { isActive: true, isDeleted: false },
            include: {
              plan: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.addon.count({ where }),
    ]);

    return {
      data: addons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get active addons for public use
   */
  async getActiveAddons() {
    return await this.prisma.addon.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        variants: {
          where: { isDeleted: false },
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get addon by ID
   */
  async getAddonById(id: string) {
    const addon = await this.prisma.addon.findUnique({
      where: { id },
      include: {
        variants: {
          where: { isDeleted: false },
          orderBy: { price: 'asc' },
        },
        planAddons: {
          where: { isActive: true, isDeleted: false },
          include: {
            plan: {
              select: { id: true, name: true, slug: true, description: true },
            },
          },
        },
      },
    });

    if (!addon) {
      throw new NotFoundException('Addon not found');
    }

    return addon;
  }

  /**
   * Create a new addon
   */
  async createAddon(createAddonDto: CreateAddonDto) {
    try {
      const addon = await this.prisma.addon.create({
        data: createAddonDto,
        include: {
          variants: true,
        },
      });

      this.logger.log(`Created addon: ${addon.name} (${addon.id})`);
      return addon;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Addon with this name already exists');
        }
      }
      this.logger.error('Failed to create addon', error);
      throw new BadRequestException('Failed to create addon');
    }
  }

  /**
   * Create addon with variants
   */
  async createAddonWithVariants(createAddonWithVariantsDto: CreateAddonWithVariantsDto) {
    try {
      const { variants, ...addonData } = createAddonWithVariantsDto;

      const addon = await this.prisma.addon.create({
        data: {
          ...addonData,
          variants: {
            create: variants,
          },
        },
        include: {
          variants: {
            where: { isDeleted: false },
            orderBy: { price: 'asc' },
          },
        },
      });

      this.logger.log(`Created addon with variants: ${addon.name} (${addon.id})`);
      return addon;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Addon with this name already exists');
        }
      }
      this.logger.error('Failed to create addon with variants', error);
      throw new BadRequestException('Failed to create addon with variants');
    }
  }

  /**
   * Update addon
   */
  async updateAddon(id: string, updateAddonDto: UpdateAddonDto) {
    try {
      await this.getAddonById(id); // Check if exists

      const addon = await this.prisma.addon.update({
        where: { id },
        data: {
          ...updateAddonDto,
          updatedAt: new Date(),
        },
        include: {
          variants: {
            where: { isDeleted: false },
            orderBy: { price: 'asc' },
          },
        },
      });

      this.logger.log(`Updated addon: ${addon.name} (${addon.id})`);
      return addon;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Addon with this name already exists');
        }
      }
      this.logger.error('Failed to update addon', error);
      throw new BadRequestException('Failed to update addon');
    }
  }

  /**
   * Soft delete addon
   */
  async deleteAddon(id: string) {
    try {
      await this.getAddonById(id); // Check if exists

      const addon = await this.prisma.addon.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Deleted addon: ${addon.name} (${addon.id})`);
      return { message: 'Addon deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete addon', error);
      throw new BadRequestException('Failed to delete addon');
    }
  }

  // =====================
  // ADDON VARIANT OPERATIONS
  // =====================

  /**
   * Get addon variants with filtering
   */
  async getAddonVariants(query?: AddonVariantQueryDto) {
    const {
      addonId,
      currency,
      isDeleted = false,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.AddonVariantWhereInput = {
      isDeleted,
      ...(addonId && { addonId }),
      ...(currency && { currency }),
    };

    const [variants, total] = await Promise.all([
      this.prisma.addonVariant.findMany({
        where,
        skip,
        take: limit,
        include: {
          addon: {
            select: { id: true, name: true, description: true, imageUrl: true },
          },
        },
        orderBy: { price: 'asc' },
      }),
      this.prisma.addonVariant.count({ where }),
    ]);

    return {
      data: variants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get addon variant by ID
   */
  async getAddonVariantById(id: string) {
    const variant = await this.prisma.addonVariant.findUnique({
      where: { id },
      include: {
        addon: {
          select: { id: true, name: true, description: true, imageUrl: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Addon variant not found');
    }

    return variant;
  }

  /**
   * Create addon variant
   */
  async createAddonVariant(createAddonVariantDto: CreateAddonVariantDto) {
    try {
      // Check if addon exists
      await this.getAddonById(createAddonVariantDto.addonId);

      const variant = await this.prisma.addonVariant.create({
        data: createAddonVariantDto,
        include: {
          addon: {
            select: { id: true, name: true, description: true, imageUrl: true },
          },
        },
      });

      this.logger.log(`Created addon variant: ${variant.name} (${variant.id})`);
      return variant;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to create addon variant', error);
      throw new BadRequestException('Failed to create addon variant');
    }
  }

  /**
   * Update addon variant
   */
  async updateAddonVariant(id: string, updateAddonVariantDto: UpdateAddonVariantDto) {
    try {
      await this.getAddonVariantById(id); // Check if exists

      const variant = await this.prisma.addonVariant.update({
        where: { id },
        data: {
          ...updateAddonVariantDto,
          updatedAt: new Date(),
        },
        include: {
          addon: {
            select: { id: true, name: true, description: true, imageUrl: true },
          },
        },
      });

      this.logger.log(`Updated addon variant: ${variant.name} (${variant.id})`);
      return variant;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to update addon variant', error);
      throw new BadRequestException('Failed to update addon variant');
    }
  }

  /**
   * Soft delete addon variant
   */
  async deleteAddonVariant(id: string) {
    try {
      await this.getAddonVariantById(id); // Check if exists

      const variant = await this.prisma.addonVariant.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Deleted addon variant: ${variant.name} (${variant.id})`);
      return { message: 'Addon variant deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete addon variant', error);
      throw new BadRequestException('Failed to delete addon variant');
    }
  }

  // =====================
  // PLAN ADDON OPERATIONS
  // =====================

  /**
   * Get plan addons with filtering
   */
  async getPlanAddons(query?: PlanAddonQueryDto) {
    const {
      planId,
      addonId,
      isIncludedInPlan,
      isRequired,
      isActive,
      isDeleted = false,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.PlanAddonWhereInput = {
      isDeleted,
      ...(planId && { planId }),
      ...(addonId && { addonId }),
      ...(isIncludedInPlan !== undefined && { isIncludedInPlan }),
      ...(isRequired !== undefined && { isRequired }),
      ...(isActive !== undefined && { isActive }),
    };

    const [planAddons, total] = await Promise.all([
      this.prisma.planAddon.findMany({
        where,
        skip,
        take: limit,
        include: {
          plan: {
            select: { id: true, name: true, slug: true, description: true },
          },
          addon: {
            include: {
              variants: {
                where: { isDeleted: false },
                orderBy: { price: 'asc' },
              },
            },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.planAddon.count({ where }),
    ]);

    return {
      data: planAddons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get addons for a specific plan
   */
  async getAddonsByPlanId(planId: string) {
    const planAddons = await this.prisma.planAddon.findMany({
      where: {
        planId,
        isActive: true,
        isDeleted: false,
      },
      include: {
        addon: {
          include: {
            variants: {
              where: { isDeleted: false },
              orderBy: { price: 'asc' },
            },
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return planAddons.map(planAddon => ({
      ...planAddon.addon,
      planAddonConfig: {
        id: planAddon.id,
        isIncludedInPlan: planAddon.isIncludedInPlan,
        discountPercent: planAddon.discountPercent,
        isRequired: planAddon.isRequired,
        displayOrder: planAddon.displayOrder,
      },
    }));
  }

  /**
   * Get plan addon by ID
   */
  async getPlanAddonById(id: string) {
    const planAddon = await this.prisma.planAddon.findUnique({
      where: { id },
      include: {
        plan: {
          select: { id: true, name: true, slug: true, description: true },
        },
        addon: {
          include: {
            variants: {
              where: { isDeleted: false },
              orderBy: { price: 'asc' },
            },
          },
        },
      },
    });

    if (!planAddon) {
      throw new NotFoundException('Plan addon not found');
    }

    return planAddon;
  }

  /**
   * Create plan addon
   */
  async createPlanAddon(createPlanAddonDto: CreatePlanAddonDto) {
    try {
      // Check if plan exists
      const plan = await this.prisma.plan.findUnique({
        where: { id: createPlanAddonDto.planId },
      });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      // Check if addon exists
      await this.getAddonById(createPlanAddonDto.addonId);

      // Check if relation already exists
      const existingPlanAddon = await this.prisma.planAddon.findUnique({
        where: {
          planId_addonId: {
            planId: createPlanAddonDto.planId,
            addonId: createPlanAddonDto.addonId,
          },
        },
      });

      if (existingPlanAddon) {
        throw new ConflictException('This addon is already associated with the plan');
      }

      const planAddon = await this.prisma.planAddon.create({
        data: createPlanAddonDto,
        include: {
          plan: {
            select: { id: true, name: true, slug: true, description: true },
          },
          addon: {
            include: {
              variants: {
                where: { isDeleted: false },
                orderBy: { price: 'asc' },
              },
            },
          },
        },
      });

      this.logger.log(`Created plan addon: Plan ${planAddon.plan.name} - Addon ${planAddon.addon.name} (${planAddon.id})`);
      return planAddon;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Failed to create plan addon', error);
      throw new BadRequestException('Failed to create plan addon');
    }
  }

  /**
   * Bulk create plan addons
   */
  async bulkCreatePlanAddons(bulkCreatePlanAddonsDto: BulkCreatePlanAddonsDto) {
    try {
      const { planId, addons } = bulkCreatePlanAddonsDto;

      // Check if plan exists
      const plan = await this.prisma.plan.findUnique({
        where: { id: planId },
      });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      const planAddonsData = addons.map(addon => ({
        ...addon,
        planId,
      }));

      const createdPlanAddons = await this.prisma.planAddon.createMany({
        data: planAddonsData,
        skipDuplicates: true,
      });

      this.logger.log(`Bulk created ${createdPlanAddons.count} plan addons for plan ${plan.name}`);
      
      // Return the created plan addons with full details
      return await this.getAddonsByPlanId(planId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to bulk create plan addons', error);
      throw new BadRequestException('Failed to bulk create plan addons');
    }
  }

  /**
   * Update plan addon
   */
  async updatePlanAddon(id: string, updatePlanAddonDto: UpdatePlanAddonDto) {
    try {
      await this.getPlanAddonById(id); // Check if exists

      const planAddon = await this.prisma.planAddon.update({
        where: { id },
        data: {
          ...updatePlanAddonDto,
          updatedAt: new Date(),
        },
        include: {
          plan: {
            select: { id: true, name: true, slug: true, description: true },
          },
          addon: {
            include: {
              variants: {
                where: { isDeleted: false },
                orderBy: { price: 'asc' },
              },
            },
          },
        },
      });

      this.logger.log(`Updated plan addon: ${planAddon.id}`);
      return planAddon;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to update plan addon', error);
      throw new BadRequestException('Failed to update plan addon');
    }
  }

  /**
   * Bulk update plan addons
   */
  async bulkUpdatePlanAddons(bulkUpdatePlanAddonsDto: BulkUpdatePlanAddonsDto) {
    try {
      const { addons } = bulkUpdatePlanAddonsDto;

      const updatePromises = addons.map(addon => {
        const { id, ...updateData } = addon;
        return this.prisma.planAddon.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
        });
      });

      const updatedPlanAddons = await Promise.all(updatePromises);

      this.logger.log(`Bulk updated ${updatedPlanAddons.length} plan addons`);
      return updatedPlanAddons;
    } catch (error) {
      this.logger.error('Failed to bulk update plan addons', error);
      throw new BadRequestException('Failed to bulk update plan addons');
    }
  }

  /**
   * Soft delete plan addon
   */
  async deletePlanAddon(id: string) {
    try {
      await this.getPlanAddonById(id); // Check if exists

      const planAddon = await this.prisma.planAddon.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Deleted plan addon: ${planAddon.id}`);
      return { message: 'Plan addon deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete plan addon', error);
      throw new BadRequestException('Failed to delete plan addon');
    }
  }

  /**
   * Remove addon from plan (hard delete)
   */
  async removeAddonFromPlan(planId: string, addonId: string) {
    try {
      const planAddon = await this.prisma.planAddon.findUnique({
        where: {
          planId_addonId: {
            planId,
            addonId,
          },
        },
      });

      if (!planAddon) {
        throw new NotFoundException('Plan addon relation not found');
      }

      await this.prisma.planAddon.delete({
        where: { id: planAddon.id },
      });

      this.logger.log(`Removed addon ${addonId} from plan ${planId}`);
      return { message: 'Addon removed from plan successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to remove addon from plan', error);
      throw new BadRequestException('Failed to remove addon from plan');
    }
  }
}