import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger, LoggerService } from '@nestjs/common';
import {
  CreateWorkspaceFeatureUsageDto,
  UpdateWorkspaceFeatureUsageDto,
} from 'src/dtos/plan.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CatalogService {
    private logger = new Logger('CatalogService');

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================
  // WORKSPACE FEATURE USAGE OPERATIONS
  // =====================

  async createWorkspaceFeatureUsage(data: CreateWorkspaceFeatureUsageDto) {
    try {
      // Check if workspace, office location, and feature exist
      const [workspace, officeLocation, feature] = await Promise.all([
        this.prisma.workspace.findFirst({
          where: { id: data.workspaceId, isActive: true },
        }),
        this.prisma.officeLocation.findFirst({
          where: { id: data.officeLocationId, isActive: true },
        }),
        this.prisma.feature.findFirst({
          where: { id: data.featureId, isActive: true, isDeleted: false },
        }),
      ]);

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      if (!officeLocation) {
        throw new NotFoundException('Office location not found');
      }

      if (!feature) {
        throw new NotFoundException('Feature not found');
      }

      // Check if usage record already exists for this month
      const existingUsage = await this.prisma.workspaceFeatureUsage.findFirst({
        where: {
          workspaceId: data.workspaceId,
          officeLocationId: data.officeLocationId,
          featureId: data.featureId,
          usedAt: data.usedAt,
        },
      });

      if (existingUsage) {
        throw new ConflictException('Feature usage for this month already exists');
      }

      return await this.prisma.workspaceFeatureUsage.create({
        data,
        include: {
          workspace: {
            select: { id: true, name: true },
          },
          officeLocation: true,
          feature: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create workspace feature usage: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create workspace feature usage');
    }
  }

  async updateWorkspaceFeatureUsage(id: string, data: UpdateWorkspaceFeatureUsageDto) {
    try {
      return await this.prisma.workspaceFeatureUsage.update({
        where: { id },
        data,
        include: {
          workspace: {
            select: { id: true, name: true },
          },
          officeLocation: true,
          feature: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update workspace feature usage: ${error.message}`);
      throw new BadRequestException('Failed to update workspace feature usage');
    }
  }

  async incrementWorkspaceFeatureUsage(workspaceId: string, officeLocationId: string, featureId: string, incrementBy: number = 1) {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      // Try to increment existing usage
      const existingUsage = await this.prisma.workspaceFeatureUsage.findFirst({
        where: {
          workspaceId,
          officeLocationId,
          featureId,
          usedAt: currentMonth,
        },
      });

      if (existingUsage) {
        return await this.prisma.workspaceFeatureUsage.update({
          where: { id: existingUsage.id },
          data: {
            usedCount: { increment: incrementBy },
          },
          include: {
            workspace: {
              select: { id: true, name: true },
            },
            officeLocation: true,
            feature: true,
          },
        });
      } else {
        // Create new usage record
        return await this.createWorkspaceFeatureUsage({
          workspaceId,
          officeLocationId,
          featureId,
          usedAt: currentMonth,
          usedCount: incrementBy,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to increment workspace feature usage: ${error.message}`);
      throw new BadRequestException('Failed to increment workspace feature usage');
    }
  }

} 