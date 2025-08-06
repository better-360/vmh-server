import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateFeatureDto, UpdateFeatureDto, FeatureResponseDto } from 'src/dtos/feature.dto';
import {
  CreatePlanFeatureDto,
  UpdatePlanFeatureDto,
  PlanFeatureResponseDto,
} from 'src/dtos/plan.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeaturesService {
  private readonly logger = new Logger('FeaturesService');

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // FEATURE CRUD OPERATIONS
  // =====================

  async createFeature(createFeatureDto: CreateFeatureDto): Promise<FeatureResponseDto> {
    try {
      // Check if feature with same name already exists
      const existingFeature = await this.prisma.feature.findFirst({
        where: {
          name: createFeatureDto.name,
          isDeleted: false,
        },
      });

      if (existingFeature) {
        throw new ConflictException(`Feature with name "${createFeatureDto.name}" already exists`);
      }

      const feature = await this.prisma.feature.create({
        data: createFeatureDto,
      });

      return feature;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to create feature: ${error.message}`);
      throw new BadRequestException('Failed to create feature');
    }
  }

  async getFeatures(
    isActive?: boolean,
    search?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<FeatureResponseDto[]> {
    try {
      const where: Prisma.FeatureWhereInput = {
        isDeleted: false,
      };

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
      }

      return await this.prisma.feature.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.logger.error(`Failed to get features: ${error.message}`);
      throw new BadRequestException('Failed to get features');
    }
  }

  async getFeatureById(id: string): Promise<FeatureResponseDto> {
    try {
      const feature = await this.prisma.feature.findUnique({
        where: { id },
        include: {
          planFeatures: {
            include: {
              plan: {
                include: {
                  officeLocation: true,
                },
              },
            },
            where: {
              isActive: true,
              isDeleted: false,
            },
          },
          productFeature: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!feature || feature.isDeleted) {
        throw new NotFoundException(`Feature with ID ${id} not found`);
      }

      return feature;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get feature: ${error.message}`);
      throw new BadRequestException('Failed to get feature');
    }
  }

  async updateFeature(id: string, updateFeatureDto: UpdateFeatureDto): Promise<FeatureResponseDto> {
    try {
      // Check if feature exists
      const existingFeature = await this.prisma.feature.findUnique({
        where: { id },
      });

      if (!existingFeature || existingFeature.isDeleted) {
        throw new NotFoundException(`Feature with ID ${id} not found`);
      }

      // Check if name is being updated and conflicts with another feature
      if (updateFeatureDto.name && updateFeatureDto.name !== existingFeature.name) {
        const nameConflict = await this.prisma.feature.findFirst({
          where: {
            name: updateFeatureDto.name,
            isDeleted: false,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ConflictException(`Feature with name "${updateFeatureDto.name}" already exists`);
        }
      }

      const feature = await this.prisma.feature.update({
        where: { id },
        data: updateFeatureDto,
      });

      return feature;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to update feature: ${error.message}`);
      throw new BadRequestException('Failed to update feature');
    }
  }

  async deleteFeature(id: string): Promise<void> {
    try {
      const existingFeature = await this.prisma.feature.findUnique({
        where: { id },
        include: {
          planFeatures: {
            where: {
              isActive: true,
              isDeleted: false,
            },
          },
          productFeature: true,
        },
      });

      if (!existingFeature || existingFeature.isDeleted) {
        throw new NotFoundException(`Feature with ID ${id} not found`);
      }

      // Check if feature is being used in any active plans or products
      if (existingFeature.planFeatures.length > 0 || existingFeature.productFeature.length > 0) {
        throw new ConflictException('Cannot delete feature that is being used in plans or products');
      }

      await this.prisma.feature.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to delete feature: ${error.message}`);
      throw new BadRequestException('Failed to delete feature');
    }
  }

  // =====================
  // PLAN FEATURE OPERATIONS
  // =====================

  async createPlanFeature(createPlanFeatureDto: CreatePlanFeatureDto): Promise<PlanFeatureResponseDto> {
    try {
      // Check if plan feature already exists
      const existingPlanFeature = await this.prisma.planFeature.findFirst({
        where: {
          planId: createPlanFeatureDto.planId,
          featureId: createPlanFeatureDto.featureId,
          isDeleted: false,
        },
      });

      if (existingPlanFeature) {
        throw new ConflictException('This feature is already added to the plan');
      }

      // Verify plan and feature exist
      const [plan, feature] = await Promise.all([
        this.prisma.plan.findUnique({
          where: { id: createPlanFeatureDto.planId },
        }),
        this.prisma.feature.findUnique({
          where: { id: createPlanFeatureDto.featureId },
        }),
      ]);

      if (!plan || plan.isDeleted) {
        throw new NotFoundException('Plan not found');
      }

      if (!feature || feature.isDeleted) {
        throw new NotFoundException('Feature not found');
      }

      const planFeature = await this.prisma.planFeature.create({
        data: createPlanFeatureDto,
        include: {
          plan: true,
          feature: true,
        },
      });

      return planFeature;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to create plan feature: ${error.message}`);
      throw new BadRequestException('Failed to create plan feature');
    }
  }

  async getPlanFeatures(
    planId?: string,
    featureId?: string,
    isActive?: boolean,
  ): Promise<PlanFeatureResponseDto[]> {
    try {
      const where: Prisma.PlanFeatureWhereInput = {
        isDeleted: false,
      };

      if (planId) where.planId = planId;
      if (featureId) where.featureId = featureId;
      if (isActive !== undefined) where.isActive = isActive;

      return await this.prisma.planFeature.findMany({
        where,
        include: {
          plan: {
            include: {
              officeLocation: true,
            },
          },
          feature: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      });
    } catch (error) {
      this.logger.error(`Failed to get plan features: ${error.message}`);
      throw new BadRequestException('Failed to get plan features');
    }
  }

  async updatePlanFeature(id: string, updatePlanFeatureDto: UpdatePlanFeatureDto): Promise<PlanFeatureResponseDto> {
    try {
      const existingPlanFeature = await this.prisma.planFeature.findUnique({
        where: { id },
      });

      if (!existingPlanFeature || existingPlanFeature.isDeleted) {
        throw new NotFoundException(`Plan feature with ID ${id} not found`);
      }

      const planFeature = await this.prisma.planFeature.update({
        where: { id },
        data: updatePlanFeatureDto,
        include: {
          plan: true,
          feature: true,
        },
      });

      return planFeature;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update plan feature: ${error.message}`);
      throw new BadRequestException('Failed to update plan feature');
    }
  }

  async deletePlanFeature(id: string): Promise<void> {
    try {
      const existingPlanFeature = await this.prisma.planFeature.findUnique({
        where: { id },
      });

      if (!existingPlanFeature || existingPlanFeature.isDeleted) {
        throw new NotFoundException(`Plan feature with ID ${id} not found`);
      }

      await this.prisma.planFeature.update({
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
      this.logger.error(`Failed to delete plan feature: ${error.message}`);
      throw new BadRequestException('Failed to delete plan feature');
    }
  }

  // =====================
  // HELPER METHODS
  // =====================

  async getFeatureUsageStats(featureId: string) {
    try {
      const feature = await this.getFeatureById(featureId);

      const [totalUsage, activeUsage, recentUsage] = await Promise.all([
        this.prisma.featureUsage.aggregate({
          where: { featureId },
          _sum: { usedCount: true },
          _count: true,
        }),
        this.prisma.featureUsage.count({
          where: {
            featureId,
            periodEnd: {
              gte: new Date(),
            },
          },
        }),
        this.prisma.featureUsage.count({
          where: {
            featureId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      return {
        feature,
        totalUsageCount: totalUsage._sum.usedCount || 0,
        totalUsageRecords: totalUsage._count,
        activeUsageRecords: activeUsage,
        recentUsageRecords: recentUsage,
      };
    } catch (error) {
      this.logger.error(`Failed to get feature usage stats: ${error.message}`);
      throw new BadRequestException('Failed to get feature usage stats');
    }
  }

  async bulkCreatePlanFeatures(planId: string, features: Omit<CreatePlanFeatureDto, 'planId'>[]): Promise<PlanFeatureResponseDto[]> {
    try {
      // Verify plan exists
      const plan = await this.prisma.plan.findUnique({
        where: { id: planId },
      });

      if (!plan || plan.isDeleted) {
        throw new NotFoundException('Plan not found');
      }

      // Create all plan features in a transaction
      const createdFeatures = await this.prisma.$transaction(async (tx) => {
        const results = [];
        for (const feature of features) {
          const planFeature = await tx.planFeature.create({
            data: {
              ...feature,
              planId,
            },
            include: {
              plan: true,
              feature: true,
            },
          });
          results.push(planFeature);
        }
        return results;
      });

      return createdFeatures;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to bulk create plan features: ${error.message}`);
      throw new BadRequestException('Failed to bulk create plan features');
    }
  }
}