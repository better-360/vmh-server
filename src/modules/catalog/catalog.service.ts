import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { CreateFeatureDto, UpdateFeatureDto } from 'src/dtos/feature.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  private logger = new Logger('CatalogService');

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================
  // FEATURE USAGE METHODS
  // =====================

  async createFeatureUsage(mailBoxId: string, featureId: string, usedCount: number = 1) {
    try {
      // Get current period dates
      const currentPeriodStart = new Date();
      currentPeriodStart.setDate(1); // Start of current month
      currentPeriodStart.setHours(0, 0, 0, 0);
      
      const currentPeriodEnd = new Date(currentPeriodStart);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      currentPeriodEnd.setDate(0); // End of current month
      currentPeriodEnd.setHours(23, 59, 59, 999);

      // Check if usage record already exists for this period
      const existingUsage = await this.prisma.featureUsage.findFirst({
        where: {
          mailBoxId,
          featureId,
          periodStart: {
            gte: currentPeriodStart,
          },
          periodEnd: {
            lte: currentPeriodEnd,
          },
        },
      });

      if (existingUsage) {
        // Update existing usage
        return await this.prisma.featureUsage.update({
          where: { id: existingUsage.id },
          data: {
            usedCount: {
              increment: usedCount,
            },
          },
          include: {
            mailbox: {
              include: {
                workspace: {
                  select: { id: true, name: true },
                },
              },
            },
            feature: true,
          },
        });
      } else {
        // Create new usage record
        return await this.prisma.featureUsage.create({
          data: {
            mailBoxId,
            featureId,
            periodStart: currentPeriodStart,
            periodEnd: currentPeriodEnd,
            usedCount,
          },
          include: {
            mailbox: {
              include: {
                workspace: {
                  select: { id: true, name: true },
                },
              },
            },
            feature: true,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to create/update feature usage: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create/update feature usage');
    }
  }

  async getFeatureUsage(mailBoxId: string, featureId?: string, periodStart?: Date, periodEnd?: Date) {
    try {
      const where: Prisma.FeatureUsageWhereInput = {
        mailBoxId,
      };

      if (featureId) {
        where.featureId = featureId;
      }

      if (periodStart) {
        where.periodStart = {
          gte: periodStart,
        };
      }

      if (periodEnd) {
        where.periodEnd = {
          lte: periodEnd,
        };
      }

      return await this.prisma.featureUsage.findMany({
        where,
        include: {
          mailbox: {
            include: {
              workspace: {
                select: { id: true, name: true },
              },
            },
          },
          feature: true,
        },
        orderBy: {
          periodStart: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get feature usage: ${error.message}`);
      throw new BadRequestException('Failed to get feature usage');
    }
  }

  async getCurrentMonthUsage(mailBoxId: string, featureId: string) {
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1);
    currentPeriodStart.setHours(0, 0, 0, 0);
    
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    currentPeriodEnd.setDate(0);
    currentPeriodEnd.setHours(23, 59, 59, 999);

    return this.getFeatureUsage(mailBoxId, featureId, currentPeriodStart, currentPeriodEnd);
  }

  // =====================
  // PLAN TEMPLATE METHODS (Placeholder for future implementation)
  // =====================

  async getPlanTemplates() {
    try {
      return await this.prisma.planTemplate.findMany({
        where: {
          isActive: true,
          isDeleted: false,
        },
        include: {
          features: {
            include: {
              feature: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get plan templates: ${error.message}`);
      throw new BadRequestException('Failed to get plan templates');
    }
  }

  async getPlanTemplateById(id: string) {
    try {
      const template = await this.prisma.planTemplate.findUnique({
        where: { id },
        include: {
          features: {
            include: {
              feature: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      if (!template || template.isDeleted) {
        throw new NotFoundException(`Plan template with ID ${id} not found`);
      }

      return template;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get plan template: ${error.message}`);
      throw new BadRequestException('Failed to get plan template');
    }
  }

  // =====================
  // MAILBOX VALIDATION METHODS
  // =====================

  async validateMailboxAccess(mailBoxId: string, workspaceId: string) {
    try {
      const mailbox = await this.prisma.mailbox.findFirst({
        where: {
          id: mailBoxId,
          workspaceId,
          isActive: true,
        },
      });

      if (!mailbox) {
        throw new NotFoundException(`Mailbox with ID ${mailBoxId} not found or not accessible`);
      }

      return mailbox;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to validate mailbox access: ${error.message}`);
      throw new BadRequestException('Failed to validate mailbox access');
    }
  }

  async getMailboxFeatureLimits(mailBoxId: string) {
    try {
      const mailbox = await this.prisma.mailbox.findUnique({
        where: { id: mailBoxId },
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
        throw new NotFoundException(`Mailbox with ID ${mailBoxId} not found`);
      }

      return mailbox.plan.features.map(planFeature => ({
        featureId: planFeature.featureId,
        featureName: planFeature.feature.name,
        includedLimit: planFeature.includedLimit,
        unitPrice: planFeature.unitPrice,
        resetCycle: planFeature.resetCycle,
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get mailbox feature limits: ${error.message}`);
      throw new BadRequestException('Failed to get mailbox feature limits');
    }
  }

}