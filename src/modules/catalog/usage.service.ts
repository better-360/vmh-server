import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeatureUsageService {
  private readonly logger = new Logger('FeatureUsageService');

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // FEATURE USAGE OPERATIONS
  // =====================

  async getOrCreateCurrentPeriod(mailboxId: string, featureId: string) {
    try {
      // Validate mailbox exists
      const mailbox = await this.prisma.mailbox.findUnique({
        where: { id: mailboxId },
        include: {
          plan: {
            include: {
              features: {
                where: {
                  featureId,
                  isActive: true,
                  isDeleted: false,
                },
              },
            },
          },
        },
      });

      if (!mailbox) {
        throw new NotFoundException(`Mailbox with ID ${mailboxId} not found`);
      }

      const planFeature = mailbox.plan.features[0];
    if (!planFeature) {
        throw new NotFoundException(`Feature ${featureId} not found in mailbox plan`);
      }

      // Calculate current period based on reset cycle
    const now = new Date();
      let periodStart: Date;
      let periodEnd: Date;

      switch (planFeature.resetCycle) {
        case 'MONTHLY':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        case 'YEARLY':
          periodStart = new Date(now.getFullYear(), 0, 1);
          periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        case 'WEEKLY':
          const dayOfWeek = now.getDay();
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - dayOfWeek);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodStart.getDate() + 6);
          periodEnd.setHours(23, 59, 59, 999);
          break;
        case 'QUARTERLY':
          const quarter = Math.floor(now.getMonth() / 3);
          periodStart = new Date(now.getFullYear(), quarter * 3, 1);
          periodEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
          break;
        case 'DAILY':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          break;
        default:
          // ONE_TIME or NO_RESET
          periodStart = mailbox.startDate;
          periodEnd = mailbox.endDate || new Date(2099, 11, 31);
      }

      // Find or create usage record
      let usage = await this.prisma.featureUsage.findFirst({
      where: {
          mailBoxId: mailboxId,
          featureId,
          periodStart,
          periodEnd,
      },
    });

    if (!usage) {
      usage = await this.prisma.featureUsage.create({
        data: {
            mailBoxId: mailboxId,
            featureId,
          periodStart,
          periodEnd,
            usedCount: 0,
          },
        });
      }

      return {
        usage,
        planFeature,
        remainingLimit: planFeature.includedLimit ? 
          Math.max(0, planFeature.includedLimit - usage.usedCount) : 
          null, // null means unlimited
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get or create current period: ${error.message}`);
      throw new BadRequestException('Failed to get or create current period');
    }
  }

  async incrementUsage(mailboxId: string, featureId: string, incrementBy: number = 1) {
    try {
      const { usage, planFeature } = await this.getOrCreateCurrentPeriod(mailboxId, featureId);

      // Check if usage would exceed limit
      if (planFeature.includedLimit !== null) {
        const newUsageCount = usage.usedCount + incrementBy;
        if (newUsageCount > planFeature.includedLimit) {
          throw new BadRequestException(
            `Usage limit exceeded. Limit: ${planFeature.includedLimit}, Current: ${usage.usedCount}, Requested: ${incrementBy}`
          );
        }
      }

      // Update usage
      const updatedUsage = await this.prisma.featureUsage.update({
        where: { id: usage.id },
        data: {
          usedCount: {
            increment: incrementBy,
          },
        },
        include: {
          mailbox: {
            include: {
              workspace: true,
            },
          },
          feature: true,
        },
      });

      return updatedUsage;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to increment usage: ${error.message}`);
      throw new BadRequestException('Failed to increment usage');
    }
  }

  async getUsageHistory(
    mailboxId: string, 
    featureId?: string, 
    limit: number = 50, 
    offset: number = 0
  ) {
    try {
      const where: Prisma.FeatureUsageWhereInput = {
        mailBoxId: mailboxId,
      };

      if (featureId) {
        where.featureId = featureId;
      }

      const usages = await this.prisma.featureUsage.findMany({
        where,
        include: {
          feature: true,
          mailbox: {
            include: {
              workspace: true,
              plan: true,
            },
          },
        },
        orderBy: {
          periodStart: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return usages;
    } catch (error) {
      this.logger.error(`Failed to get usage history: ${error.message}`);
      throw new BadRequestException('Failed to get usage history');
    }
  }

  async getCurrentUsageSummary(mailboxId: string) {
    try {
      const mailbox = await this.prisma.mailbox.findUnique({
        where: { id: mailboxId },
        include: {
          plan: {
            include: {
              features: {
                include: {
                  feature: true,
                },
                where: {
                  isActive: true,
                  isDeleted: false,
                },
              },
            },
          },
        },
      });

      if (!mailbox) {
        throw new NotFoundException(`Mailbox with ID ${mailboxId} not found`);
      }

      const usageSummary = [];

      for (const planFeature of mailbox.plan.features) {
        const { usage, remainingLimit } = await this.getOrCreateCurrentPeriod(
          mailboxId, 
          planFeature.featureId
        );

        usageSummary.push({
          featureId: planFeature.featureId,
          featureName: planFeature.feature.name,
          includedLimit: planFeature.includedLimit,
          usedCount: usage.usedCount,
          remainingLimit,
          resetCycle: planFeature.resetCycle,
          unitPrice: planFeature.unitPrice,
          periodStart: usage.periodStart,
          periodEnd: usage.periodEnd,
        });
      }

      return usageSummary;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get current usage summary: ${error.message}`);
      throw new BadRequestException('Failed to get current usage summary');
    }
  }

  async resetUsageForNewPeriod() {
    try {
      this.logger.log('Starting usage reset for new period');

      // This would typically be called by a cron job
      // Find all active mailboxes
      const mailboxes = await this.prisma.mailbox.findMany({
        where: {
          isActive: true,
        },
        include: {
          plan: {
            include: {
              features: {
                where: {
                  isActive: true,
                  isDeleted: false,
                },
              },
            },
          },
        },
      });

      let resetCount = 0;

      for (const mailbox of mailboxes) {
        for (const planFeature of mailbox.plan.features) {
          // Create new period for each feature based on its reset cycle
          await this.getOrCreateCurrentPeriod(mailbox.id, planFeature.featureId);
          resetCount++;
        }
      }

      this.logger.log(`Usage reset completed. ${resetCount} usage periods created/updated`);
      return { resetCount };
    } catch (error) {
      this.logger.error(`Failed to reset usage for new period: ${error.message}`);
      throw new BadRequestException('Failed to reset usage for new period');
    }
  }

  // =====================
  // ANALYTICS METHODS
  // =====================

  async getUsageAnalytics(workspaceId?: string, featureId?: string, startDate?: Date, endDate?: Date) {
    try {
      const where: Prisma.FeatureUsageWhereInput = {};

      if (workspaceId) {
        where.mailbox = {
          workspaceId,
        };
      }

      if (featureId) {
        where.featureId = featureId;
      }

      if (startDate || endDate) {
        where.periodStart = {};
        if (startDate) where.periodStart.gte = startDate;
        if (endDate) where.periodStart.lte = endDate;
      }

      const [totalUsage, usageByFeature, usageByPeriod] = await Promise.all([
        // Total usage aggregation
        this.prisma.featureUsage.aggregate({
          where,
          _sum: { usedCount: true },
          _avg: { usedCount: true },
          _count: true,
        }),

        // Usage grouped by feature
        this.prisma.featureUsage.groupBy({
          by: ['featureId'],
          where,
          _sum: { usedCount: true },
          _count: true,
        }),

        // Usage by time period
        this.prisma.featureUsage.findMany({
          where,
          select: {
            periodStart: true,
            periodEnd: true,
            usedCount: true,
            feature: {
              select: { name: true },
            },
          },
          orderBy: { periodStart: 'desc' },
          take: 100,
        }),
      ]);

      return {
        totalUsage,
        usageByFeature,
        usageByPeriod,
      };
    } catch (error) {
      this.logger.error(`Failed to get usage analytics: ${error.message}`);
      throw new BadRequestException('Failed to get usage analytics');
    }
  }
}