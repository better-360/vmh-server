import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
  FeatureQueryDto,
  CreatePlanFeatureDto,
  UpdatePlanFeatureDto,
  PlanFeatureQueryDto,
  BulkCreatePlanFeaturesDto,
  BulkUpdatePlanFeaturesDto,
} from 'src/dtos/plan.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeaturesService {
  private readonly logger = new Logger('FeaturesService');

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getFeatures(query?: FeatureQueryDto) {
    const {
      isActive,
      search,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.FeatureWhereInput = {
      isDeleted: false,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [features, total] = await Promise.all([
      this.prisma.feature.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feature.count({ where }),
    ]);

    return {
      data: features,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFeatureById(id: string) {
    const feature = await this.prisma.feature.findFirst({
      where: { id, isDeleted: false },
    });

    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    return feature;
  }

  async createFeature(data: CreateFeatureDto) {
    try {
      // Check if feature name already exists
      const existingFeature = await this.prisma.feature.findFirst({
        where: { name: data.name, isDeleted: false },
      });

      if (existingFeature) {
        throw new ConflictException('Feature with this name already exists');
      }

      return await this.prisma.feature.create({
        data,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create feature');
    }
  }

  async updateFeature(id: string, data: UpdateFeatureDto) {
    await this.getFeatureById(id); // Check if exists

    try {
      // Check if name already exists for other features
      if (data.name) {
        const existingFeature = await this.prisma.feature.findFirst({
          where: { name: data.name, id: { not: id }, isDeleted: false },
        });

        if (existingFeature) {
          throw new ConflictException('Feature with this name already exists');
        }
      }

      return await this.prisma.feature.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update feature');
    }
  }

  async deleteFeature(id: string) {
    await this.getFeatureById(id); // Check if exists

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Soft delete plan features that use this feature
        await tx.planFeature.updateMany({
          where: { featureId: id },
          data: { isDeleted: true, deletedAt: new Date() },
        });

        // Soft delete feature
        return tx.feature.update({
          where: { id },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: new Date(),
          },
        });
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete feature');
    }
  }

  // =====================
  // PLAN FEATURE OPERATIONS
  // =====================

  async getPlanFeatures(query?: PlanFeatureQueryDto) {
    const { planId, featureId } = query || {};

    const where: Prisma.PlanFeatureWhereInput = {
      isDeleted: false,
      ...(planId && { planId }),
      ...(featureId && { featureId }),
    };

    return await this.prisma.planFeature.findMany({
      where,
      include: {
        plan: {
          select: { id: true, name: true, description: true },
        },
        feature: {
          select: { id: true, name: true, description: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanFeatureById(id: string) {
    const planFeature = await this.prisma.planFeature.findFirst({
      where: { id, isDeleted: false },
      include: {
        plan: true,
        feature: true,
      },
    });

    if (!planFeature) {
      throw new NotFoundException('Plan feature not found');
    }

    return planFeature;
  }

  async createPlanFeature(data: CreatePlanFeatureDto) {
    try {
      // Check if plan and feature exist
      const [plan, feature] = await Promise.all([
        this.prisma.plan.findFirst({
          where: { id: data.planId, isDeleted: false },
        }),
        this.prisma.feature.findFirst({
          where: { id: data.featureId, isDeleted: false },
        }),
      ]);

      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      if (!feature) {
        throw new NotFoundException('Feature not found');
      }

      // Check if plan feature already exists
      const existingPlanFeature = await this.prisma.planFeature.findFirst({
        where: {
          planId: data.planId,
          featureId: data.featureId,
          isDeleted: false,
        },
      });

      if (existingPlanFeature) {
        throw new ConflictException('This feature is already added to the plan');
      }

      return await this.prisma.planFeature.create({
        data,
        include: {
          plan: true,
          feature: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create plan feature');
    }
  }

  async updatePlanFeature(id: string, data: UpdatePlanFeatureDto) {
    await this.getPlanFeatureById(id); // Check if exists

    try {
      return await this.prisma.planFeature.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          plan: true,
          feature: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update plan feature');
    }
  }

  async deletePlanFeature(id: string) {
    await this.getPlanFeatureById(id); // Check if exists

    try {
      return await this.prisma.planFeature.update({
        where: { id },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete plan feature');
    }
  }

  // =====================
  // BULK OPERATIONS
  // =====================

  async bulkCreatePlanFeatures(data: BulkCreatePlanFeaturesDto) {
    const { planId, features } = data;

    try {
      // Check if plan exists
      const plan = await this.prisma.plan.findFirst({
        where: { id: planId, isDeleted: false },
      });

      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      // Check if all features exist
      const featureIds = features.map(f => f.featureId);
      const existingFeatures = await this.prisma.feature.findMany({
        where: { id: { in: featureIds }, isDeleted: false },
      });

      if (existingFeatures.length !== featureIds.length) {
        throw new NotFoundException('One or more features not found');
      }

      // Check for existing plan features
      const existingPlanFeatures = await this.prisma.planFeature.findMany({
        where: {
          planId,
          featureId: { in: featureIds },
          isDeleted: false,
        },
      });

      if (existingPlanFeatures.length > 0) {
        throw new ConflictException('Some features are already added to this plan');
      }

      return await this.prisma.$transaction(async (tx) => {
        const createPromises = features.map(feature =>
          tx.planFeature.create({
            data: {
              planId,
              ...feature,
            },
            include: {
              plan: true,
              feature: true,
            },
          })
        );

        return Promise.all(createPromises);
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to bulk create plan features');
    }
  }

  async bulkUpdatePlanFeatures(data: BulkUpdatePlanFeaturesDto) {
    const { features } = data;

    try {
      // Check if all plan features exist
      const planFeatureIds = features.map(f => f.id);
      const existingPlanFeatures = await this.prisma.planFeature.findMany({
        where: { id: { in: planFeatureIds }, isDeleted: false },
      });

      if (existingPlanFeatures.length !== planFeatureIds.length) {
        throw new NotFoundException('One or more plan features not found');
      }

      return await this.prisma.$transaction(async (tx) => {
        const updatePromises = features.map(feature =>
          tx.planFeature.update({
            where: { id: feature.id },
            data: {
              ...(feature.includedLimit !== undefined && { includedLimit: feature.includedLimit }),
              ...(feature.unitPrice !== undefined && { unitPrice: feature.unitPrice }),
              updatedAt: new Date(),
            },
            include: {
              plan: true,
              feature: true,
            },
          })
        );

        return Promise.all(updatePromises);
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to bulk update plan features');
    }
  }

    async getFeatureUsageInPlans(featureId: string) {
    await this.getFeatureById(featureId); // Check if exists

    return await this.prisma.planFeature.findMany({
      where: { featureId, isDeleted: false },
      include: {
        plan: {
          select: { id: true, name: true, description: true, isActive: true },
        },
      },
    });
  }

}