import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreatePlanFeatureDto, PlanFeatureResponseDto, UpdatePlanFeatureDto } from "src/dtos/plan_entitlements.dto";
import { PrismaService } from "src/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class PlanFeaturesService {
  private readonly logger = new Logger(PlanFeaturesService.name);
  constructor(private readonly prisma: PrismaService) {}

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