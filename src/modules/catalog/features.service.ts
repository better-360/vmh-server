import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
  FeatureResponseDto,
} from 'src/dtos/feature.dto';
import { Prisma } from '@prisma/client';
import {
  CreatePlanFeatureDto,
  PlanFeatureResponseDto,
  UpdatePlanFeatureDto,
} from 'src/dtos/plan_entitlements.dto';

@Injectable()
export class FeaturesService {
  private readonly logger = new Logger('FeaturesService');

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // FEATURE CRUD OPERATIONS
  // =====================

  async createFeature(
    createFeatureDto: CreateFeatureDto,
  ): Promise<FeatureResponseDto> {
    try {
      // Check if feature with same name already exists
      const existingFeature = await this.prisma.feature.findFirst({
        where: {
          name: createFeatureDto.name,
          isDeleted: false,
        },
      });

      if (existingFeature) {
        throw new ConflictException(
          `Feature with name "${createFeatureDto.name}" already exists`,
        );
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
    search?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<FeatureResponseDto[]> {
    try {
      const where: Prisma.FeatureWhereInput = {
        isDeleted: false,
      };

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

      return this.prisma.feature.findMany({
        where: {
          isDeleted: false,
          ...{ isActive:true },
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: { name: 'asc' },
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

  async updateFeature(
    id: string,
    updateFeatureDto: UpdateFeatureDto,
  ): Promise<FeatureResponseDto> {
    try {
      // Check if feature exists
      const existingFeature = await this.prisma.feature.findUnique({
        where: { id },
      });

      if (!existingFeature || existingFeature.isDeleted) {
        throw new NotFoundException(`Feature with ID ${id} not found`);
      }

      // Check if name is being updated and conflicts with another feature
      if (
        updateFeatureDto.name &&
        updateFeatureDto.name !== existingFeature.name
      ) {
        const nameConflict = await this.prisma.feature.findFirst({
          where: {
            name: updateFeatureDto.name,
            isDeleted: false,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ConflictException(
            `Feature with name "${updateFeatureDto.name}" already exists`,
          );
        }
      }

      const feature = await this.prisma.feature.update({
        where: { id },
        data: updateFeatureDto,
      });

      return feature;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
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
      if (
        existingFeature.planFeatures.length > 0 ||
        existingFeature.productFeature.length > 0
      ) {
        throw new ConflictException(
          'Cannot delete feature that is being used in plans or products',
        );
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
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(`Failed to delete feature: ${error.message}`);
      throw new BadRequestException('Failed to delete feature');
    }
  }
}
