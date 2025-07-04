import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanQueryDto,
  CreatePlanPriceDto,
  UpdatePlanPriceDto,
  PlanPriceQueryDto,
  CreatePlanFromTemplateDto,
} from 'src/dtos/plan.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlansService {
  private readonly logger = new Logger('PlansService');

  constructor(private readonly prisma: PrismaService) {}

  async getPlans(query?: PlanQueryDto) {
    const {
      isActive,
      isDeleted = false,
      search,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.PlanWhereInput = {
      isDeleted,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [plans, total] = await Promise.all([
      this.prisma.plan.findMany({
        where,
        skip,
        take: limit,
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: {
            where: { isActive: true, isDeleted: false },
            orderBy: { amount: 'asc' },
          },
          features: {
            where: { isActive: true, isDeleted: false },
            include: {
              feature: {
                select: { id: true, name: true, description: true, imageUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.plan.count({ where }),
    ]);

    return {
      data: plans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActivePlansWithPrices() {
    return await this.prisma.plan.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        officeLocation: {
          select: { id: true, label: true, city: true, state: true },
        },
        prices: {
          where: { isActive: true, isDeleted: false },
          orderBy: { amount: 'asc' },
        },
        features: {
          where: { isActive: true, isDeleted: false },
          include: {
            feature: {
              select: { id: true, name: true, description: true, imageUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, isDeleted: false },
      include: {
        officeLocation: {
          select: { id: true, label: true, city: true, state: true },
        },
        prices: {
          where: { isActive: true, isDeleted: false },
          orderBy: { amount: 'asc' },
        },
        features: {
          where: { isActive: true, isDeleted: false },
          include: {
            feature: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async createPlan(data: CreatePlanDto) {
    try {
      // Check if office location exists
      const officeLocation = await this.prisma.officeLocation.findUnique({
        where: { id: data.officeLocationId},
      });

      if (!officeLocation) {
        throw new NotFoundException('Office location not found');
      }

      // Check if plan slug already exists for this location
      const existingPlan = await this.prisma.plan.findFirst({
        where: { 
          slug: data.slug, 
          officeLocationId: data.officeLocationId,
          isDeleted: false 
        },
      });

      if (existingPlan) {
        throw new ConflictException('Plan with this slug already exists for this location');
      }

      return await this.prisma.plan.create({
        data,
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: true,
          features: {
            include: { feature: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to create plan');
    }
  }

  async updatePlan(id: string, data: UpdatePlanDto) {
    await this.getPlanById(id); // Check if exists

    try {
      // Check if slug already exists for other plans in same location
      if (data.slug) {
        const plan = await this.prisma.plan.findUnique({ where: { id } });
        const existingPlan = await this.prisma.plan.findFirst({
          where: { 
            slug: data.slug, 
            officeLocationId: plan.officeLocationId,
            id: { not: id }, 
            isDeleted: false 
          },
        });

        if (existingPlan) {
          throw new ConflictException('Plan with this slug already exists for this location');
        }
      }

      return await this.prisma.plan.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: {
            where: { isActive: true, isDeleted: false },
          },
          features: {
            where: { isActive: true, isDeleted: false },
            include: { feature: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update plan');
    }
  }

  async deletePlan(id: string) {
    await this.getPlanById(id); // Check if exists

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Soft delete plan features
        await tx.planFeature.updateMany({
          where: { planId: id },
          data: { isDeleted: true, deletedAt: new Date() },
        });

        // Soft delete plan prices
        await tx.planPrice.updateMany({
          where: { planId: id },
          data: { isDeleted: true, deletedAt: new Date() },
        });

        // Soft delete plan
        return tx.plan.update({
          where: { id },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: new Date(),
          },
        });
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException('Failed to delete plan');
    }
  }

  async createPlanFromTemplate(data: CreatePlanFromTemplateDto) {
    try {
      // Get template with features
      const template = await this.prisma.planTemplate.findFirst({
        where: { id: data.templateId, isActive: true, isDeleted: false },
        include: {
          features: {
            where: { planTemplateId: data.templateId },
            include: {
              feature: true,
            },
          },
        },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      // Check if office location exists
      const officeLocation = await this.prisma.officeLocation.findFirst({
        where: { id: data.officeLocationId, isActive: true, isDeleted: false },
      });

      if (!officeLocation) {
        throw new NotFoundException('Office location not found');
      }

      // Generate plan data from template
      const planName = data.name || template.name;
      const planSlug = data.slug || template.slug;

      // Check if plan slug already exists for this location
      const existingPlan = await this.prisma.plan.findFirst({
        where: { 
          slug: planSlug, 
          officeLocationId: data.officeLocationId,
          isDeleted: false 
        },
      });

      if (existingPlan) {
        throw new ConflictException('Plan with this slug already exists for this location');
      }

      return await this.prisma.$transaction(async (tx) => {
        // 1. Create Plan
        const plan = await tx.plan.create({
          data: {
            officeLocationId: data.officeLocationId,
            name: planName,
            slug: planSlug,
            description: template.description,
            imageUrl: template.imageUrl,
          },
        });

        // 2. Create Plan Prices
        const priceMonthly = data.priceMonthly ?? template.priceMonthly;
        const priceYearly = data.priceYearly ?? template.priceYearly;
        const currency = data.currency ?? template.currency;

        await tx.planPrice.createMany({
          data: [
            {
              planId: plan.id,
              billingCycle: 'MONTHLY',
              amount: priceMonthly,
              currency,
            },
            {
              planId: plan.id,
              billingCycle: 'YEARLY',
              amount: priceYearly,
              currency,
            },
          ],
        });

        // 3. Create Plan Features
        if (template.features && template.features.length > 0) {
          await tx.planFeature.createMany({
            data: template.features.map(templateFeature => ({
              planId: plan.id,
              featureId: templateFeature.featureId,
              includedLimit: templateFeature.includedLimit,
              unitPrice: templateFeature.unitPrice,
            })),
          });
        }

        // Return complete plan with relations
        return tx.plan.findUnique({
          where: { id: plan.id },
          include: {
            officeLocation: {
              select: { id: true, label: true, city: true, state: true },
            },
            prices: {
              where: { isActive: true, isDeleted: false },
              orderBy: { amount: 'asc' },
            },
            features: {
              where: { isActive: true, isDeleted: false },
              include: {
                feature: true,
              },
            },
          },
        });
      });
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create plan from template');
    }
  }

  // =====================
  // PLAN PRICE OPERATIONS
  // =====================

  async getPlanPrices(query?: PlanPriceQueryDto) {
    const { planId, billingCycle, currency, isActive } = query || {};

    const where: Prisma.PlanPriceWhereInput = {
      isDeleted: false,
      ...(planId && { planId }),
      ...(billingCycle && { billingCycle }),
      ...(currency && { currency }),
      ...(isActive !== undefined && { isActive }),
    };

    return await this.prisma.planPrice.findMany({
      where,
      include: {
        plan: {
          select: { id: true, name: true, description: true, slug: true },
        },
      },
      orderBy: { amount: 'asc' },
    });
  }

  async getPlanPriceById(id: string) {
    const planPrice = await this.prisma.planPrice.findFirst({
      where: { id, isDeleted: false },
      include: {
        plan: {
          include: {
            officeLocation: {
              select: { id: true, label: true, city: true, state: true },
            },
          },
        },
      },
    });

    if (!planPrice) {
      throw new NotFoundException('Plan price not found');
    }

    return planPrice;
  }

  async createPlanPrice(data: CreatePlanPriceDto) {
    // Check if plan exists
    const plan = await this.prisma.plan.findFirst({
      where: { id: data.planId, isDeleted: false },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    try {
      // Check if price for this plan and billing cycle already exists
      const existingPrice = await this.prisma.planPrice.findFirst({
        where: {
          planId: data.planId,
          billingCycle: data.billingCycle,
          isDeleted: false,
        },
      });

      if (existingPrice) {
        throw new ConflictException('Price for this plan and billing cycle already exists');
      }

      return await this.prisma.planPrice.create({
        data,
        include: {
          plan: {
            include: {
              officeLocation: {
                select: { id: true, label: true, city: true, state: true },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create plan price');
    }
  }

  async updatePlanPrice(id: string, data: UpdatePlanPriceDto) {
    await this.getPlanPriceById(id); // Check if exists

    try {
      // Check if plan exists if planId is being updated
      if (data.planId) {
        const plan = await this.prisma.plan.findFirst({
          where: { id: data.planId, isDeleted: false },
        });

        if (!plan) {
          throw new NotFoundException('Plan not found');
        }
      }

      return await this.prisma.planPrice.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          plan: {
            include: {
              officeLocation: {
                select: { id: true, label: true, city: true, state: true },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update plan price');
    }
  }

  async deletePlanPrice(id: string) {
    await this.getPlanPriceById(id); // Check if exists

    try {
      return await this.prisma.planPrice.update({
        where: { id },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete plan price');
    }
  }
}