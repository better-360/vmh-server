import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

export interface FeatureUsageQueryDto {
  mailBoxId?: string;
  featureId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  page?: number;
  limit?: number;
}

export interface FeatureUsageResponseDto {
  id: string;
  mailBoxId: string;
  featureId: string;
  periodStart: Date;
  periodEnd: Date;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
  mailbox?: any;
  feature?: any;
}

@Injectable()
export class ReportService {
  private logger = new Logger('ReportService');
  
  constructor(private readonly prisma: PrismaService) {}

  async getFeatureUsages(query?: FeatureUsageQueryDto) {
    const {
      mailBoxId,
      featureId,
      periodStart,
      periodEnd,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.FeatureUsageWhereInput = {
      ...(mailBoxId && { mailBoxId }),
      ...(featureId && { featureId }),
      ...(periodStart && { periodStart: { gte: periodStart } }),
      ...(periodEnd && { periodEnd: { lte: periodEnd } }),
    };

    const [usages, total] = await Promise.all([
      this.prisma.featureUsage.findMany({
        where,
        skip,
        take: limit,
        include: {
          mailbox: {
            include: {
              workspace: {
                select: { id: true, name: true },
              },
            },
          },
          feature: {
            select: { id: true, name: true, description: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.featureUsage.count({ where }),
    ]);

    return {
      usages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFeatureUsageById(id: string): Promise<FeatureUsageResponseDto> {
    const usage = await this.prisma.featureUsage.findUnique({
      where: { id },
      include: {
        mailbox: {
          include: {
            workspace: {
              select: { id: true, name: true },
            },
          },
        },
        feature: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    if (!usage) {
      throw new NotFoundException(`Feature usage with ID ${id} not found`);
    }

    return usage;
  }

  async getFeatureUsageByMailbox(mailBoxId: string, query?: Omit<FeatureUsageQueryDto, 'mailBoxId'>) {
    return this.getFeatureUsages({ ...query, mailBoxId });
  }

  async getFeatureUsageStatistics(mailBoxId?: string) {
    const where: Prisma.FeatureUsageWhereInput = {
      ...(mailBoxId && { mailBoxId }),
    };

    const [
      totalUsages,
      totalCount,
      usagesByFeature,
      usagesByMailbox,
    ] = await Promise.all([
      this.prisma.featureUsage.count({ where }),
      this.prisma.featureUsage.aggregate({
        where,
        _sum: { usedCount: true },
      }),
      this.prisma.featureUsage.groupBy({
        by: ['featureId'],
        where,
        _sum: { usedCount: true },
        _count: { id: true },
      }),
      this.prisma.featureUsage.groupBy({
        by: ['mailBoxId'],
        where,
        _sum: { usedCount: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalUsages,
      totalCount: totalCount._sum.usedCount || 0,
      usagesByFeature: usagesByFeature.map(item => ({
        featureId: item.featureId,
        totalUsed: item._sum.usedCount || 0,
        recordCount: item._count.id,
      })),
      usagesByMailbox: usagesByMailbox.map(item => ({
        mailBoxId: item.mailBoxId,
        totalUsed: item._sum.usedCount || 0,
        recordCount: item._count.id,
      })),
    };
  }

  async getCurrentPeriodUsage(mailBoxId: string, featureId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usage = await this.prisma.featureUsage.findFirst({
      where: {
        mailBoxId,
        featureId,
        periodStart: { gte: startOfMonth },
        periodEnd: { lte: endOfMonth },
      },
      include: {
        feature: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    return usage || null;
  }

  async getUsageHistory(mailBoxId: string, featureId: string, months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await this.prisma.featureUsage.findMany({
      where: {
        mailBoxId,
        featureId,
        periodStart: { gte: startDate },
        periodEnd: { lte: endDate },
      },
      include: {
        feature: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { periodStart: 'asc' },
    });
  }

  async updateFeatureUsage(id: string, usedCount: number) {
    try {
      const updatedUsage = await this.prisma.featureUsage.update({
        where: { id },
        data: { usedCount, updatedAt: new Date() },
        include: {
          mailbox: {
            include: {
              workspace: {
                select: { id: true, name: true },
              },
            },
          },
          feature: {
            select: { id: true, name: true, description: true },
          },
        },
      });

      this.logger.log(`Updated feature usage ${id} to ${usedCount}`);
      return updatedUsage;
    } catch (error) {
      this.logger.error(`Failed to update feature usage ${id}: ${error.message}`);
      throw error;
    }
  }

  async incrementFeatureUsage(mailBoxId: string, featureId: string, incrementBy: number = 1) {
    try {
      // Try to find current period usage
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const existingUsage = await this.prisma.featureUsage.findFirst({
        where: {
          mailBoxId,
          featureId,
          periodStart: { gte: startOfMonth },
          periodEnd: { lte: endOfMonth },
        },
      });

      if (existingUsage) {
        // Update existing usage
        return await this.prisma.featureUsage.update({
          where: { id: existingUsage.id },
          data: { usedCount: { increment: incrementBy } },
        });
      } else {
        // Create new usage record for this period
        return await this.prisma.featureUsage.create({
          data: {
            mailBoxId,
            featureId,
            periodStart: startOfMonth,
            periodEnd: endOfMonth,
            usedCount: incrementBy,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to increment feature usage for mailbox ${mailBoxId}, feature ${featureId}: ${error.message}`);
      throw error;
    }
  }


  async getFeatureUsageStats(featureId: string) {
    try {
      const feature = await this.prisma.feature.findUnique({
        where: { id: featureId },
        include: {
          planFeatures: {
            where: {
              isActive: true,
              isDeleted: false,
            },
            include: {
              plan: {
                select: { id: true, name: true, description: true },
              },
            },
          },
        },
      });
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
}