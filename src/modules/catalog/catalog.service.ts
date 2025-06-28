import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger, LoggerService } from '@nestjs/common';
import {
  CreateFeatureUsageDto,
  UpdateFeatureUsageDto,
} from 'src/dtos/plan.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CatalogService {
    private logger = new Logger('PrismaService');

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================
  // FEATURE USAGE OPERATIONS
  // =====================


  async createFeatureUsage(data: CreateFeatureUsageDto) {
    try {
      // Check if user, office location, and feature exist
      const [user, officeLocation, feature] = await Promise.all([
        this.prisma.user.findFirst({
          where: { id: data.userId, isActive: true },
        }),
        this.prisma.officeLocation.findFirst({
          where: { id: data.officeLocationId, isActive: true },
        }),
        this.prisma.feature.findFirst({
          where: { id: data.featureId, isActive: true, isDeleted: false },
        }),
      ]);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!officeLocation) {
        throw new NotFoundException('Office location not found');
      }

      if (!feature) {
        throw new NotFoundException('Feature not found');
      }

      // Check if usage record already exists for this month
      const existingUsage = await this.prisma.userFeatureUsage.findFirst({
        where: {
          userId: data.userId,
          officeLocationId: data.officeLocationId,
          featureId: data.featureId,
          usedAt: data.usedAt,
        },
      });

      if (existingUsage) {
        throw new ConflictException('Feature usage for this month already exists');
      }

      return await this.prisma.userFeatureUsage.create({
        data,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          officeLocation: true,
          feature: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create feature usage: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create feature usage');
    }
  }

  async updateFeatureUsage(id: string, data: UpdateFeatureUsageDto) {
    try {
      return await this.prisma.userFeatureUsage.update({
        where: { id },
        data,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          officeLocation: true,
          feature: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update feature usage: ${error.message}`);
      throw new BadRequestException('Failed to update feature usage');
    }
  }

  async incrementFeatureUsage(userId: string, officeLocationId: string, featureId: string, incrementBy: number = 1) {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      // Try to increment existing usage
      const existingUsage = await this.prisma.userFeatureUsage.findFirst({
        where: {
          userId,
          officeLocationId,
          featureId,
          usedAt: currentMonth,
        },
      });

      if (existingUsage) {
        return await this.prisma.userFeatureUsage.update({
          where: { id: existingUsage.id },
          data: {
            usedCount: { increment: incrementBy },
          },
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
            officeLocation: true,
            feature: true,
          },
        });
      } else {
        // Create new usage record
        return await this.createFeatureUsage({
          userId,
          officeLocationId,
          featureId,
          usedAt: currentMonth,
          usedCount: incrementBy,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to increment feature usage: ${error.message}`);
      throw new BadRequestException('Failed to increment feature usage');
    }
  }

} 