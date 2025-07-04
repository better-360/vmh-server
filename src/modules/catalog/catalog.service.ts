import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger, LoggerService } from '@nestjs/common';
import {
  CreateWorkspaceFeatureUsageDto,
  UpdateWorkspaceFeatureUsageDto,
  CreatePlanTemplateDto,
  UpdatePlanTemplateDto,
  PlanTemplateQueryDto,
  CreatePlanTemplateFeatureDto,
  UpdatePlanTemplateFeatureDto,
} from 'src/dtos/plan.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

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

  // =====================
  // PLAN TEMPLATE OPERATIONS
  // =====================

  async getPlanTemplates(query?: PlanTemplateQueryDto) {
    const {
      isActive,
      isDeleted = false,
      search,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.PlanTemplateWhereInput = {
      isDeleted,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [templates, total] = await Promise.all([
      this.prisma.planTemplate.findMany({
        where,
        skip,
        take: limit,
        include: {
          features: {
            include: {
              feature: {
                select: { id: true, name: true, description: true, imageUrl: true },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.planTemplate.count({ where }),
    ]);

    return {
      data: templates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActivePlanTemplates() {
    return await this.prisma.planTemplate.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        features: {
          include: {
            feature: {
              select: { id: true, name: true, description: true, imageUrl: true },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPlanTemplateById(id: string) {
    const template = await this.prisma.planTemplate.findFirst({
      where: { id, isDeleted: false },
      include: {
        features: {
          include: {
            feature: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Plan template not found');
    }
    return template;
  }

  async createPlanTemplate(data: CreatePlanTemplateDto) {
    try {
      // Check if template name already exists
      const existingTemplate = await this.prisma.planTemplate.findFirst({
        where: { 
          OR: [
            { name: data.name },
            { slug: data.slug }
          ],
          isDeleted: false 
        },
      });

      if (existingTemplate) {
        throw new ConflictException('Template with this name or slug already exists');
      }

      return await this.prisma.$transaction(async (tx) => {
        // Create template
        const template = await tx.planTemplate.create({
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            imageUrl: data.imageUrl,
            priceMonthly: data.priceMonthly,
            priceYearly: data.priceYearly,
            currency: data.currency || 'USD',
          },
        });

        // Create template features if provided
        if (data.features && data.features.length > 0) {
          await tx.planTemplateFeature.createMany({
            data: data.features.map(feature => ({
              planTemplateId: template.id,
              featureId: feature.featureId,
              includedLimit: feature.includedLimit,
              unitPrice: feature.unitPrice,
              isRequired: feature.isRequired || false,
              displayOrder: feature.displayOrder,
            })),
          });
        }

        // Return with features
        return tx.planTemplate.findUnique({
          where: { id: template.id },
          include: {
            features: {
              include: {
                feature: true,
              },
              orderBy: { displayOrder: 'asc' },
            },
          },
        });
      });
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create plan template');
    }
  }

  async updatePlanTemplate(id: string, data: UpdatePlanTemplateDto) {
    await this.getPlanTemplateById(id); // Check if exists

    try {
      // Check if name or slug already exists for other templates
      if (data.name || data.slug) {
        const existingTemplate = await this.prisma.planTemplate.findFirst({
          where: { 
            OR: [
              ...(data.name ? [{ name: data.name }] : []),
              ...(data.slug ? [{ slug: data.slug }] : [])
            ],
            id: { not: id }, 
            isDeleted: false 
          },
        });

        if (existingTemplate) {
          throw new ConflictException('Template with this name or slug already exists');
        }
      }

      // Separate features from other data if they exist
      const { features, ...updateData } = data as any;

      return await this.prisma.planTemplate.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          features: {
            include: {
              feature: true,
            },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update plan template');
    }
  }

  async deletePlanTemplate(id: string) {
    await this.getPlanTemplateById(id); // Check if exists

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Soft delete template features
        await tx.planTemplateFeature.deleteMany({
          where: { planTemplateId: id },
        });

        // Soft delete template
        return tx.planTemplate.update({
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
      throw new BadRequestException('Failed to delete plan template');
    }
  }

  // =====================
  // PLAN TEMPLATE FEATURE OPERATIONS
  // =====================

  async addFeatureToTemplate(templateId: string, data: CreatePlanTemplateFeatureDto) {
    // Check if template exists
    await this.getPlanTemplateById(templateId);

    // Check if feature exists
    const feature = await this.prisma.feature.findFirst({
      where: { id: data.featureId, isActive: true, isDeleted: false },
    });

    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    try {
      // Check if feature already exists in template
      const existingFeature = await this.prisma.planTemplateFeature.findFirst({
        where: {
          planTemplateId: templateId,
          featureId: data.featureId,
        },
      });

      if (existingFeature) {
        throw new ConflictException('Feature already exists in this template');
      }

      return await this.prisma.planTemplateFeature.create({
        data: {
          planTemplateId: templateId,
          featureId: data.featureId,
          includedLimit: data.includedLimit,
          unitPrice: data.unitPrice,
          isRequired: data.isRequired || false,
          displayOrder: data.displayOrder,
        },
        include: {
          feature: true,
          planTemplate: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to add feature to template');
    }
  }

  async updateTemplateFeature(templateId: string, featureId: string, data: UpdatePlanTemplateFeatureDto) {
    // Check if template feature exists
    const templateFeature = await this.prisma.planTemplateFeature.findFirst({
      where: {
        planTemplateId: templateId,
        featureId: featureId,
      },
    });

    if (!templateFeature) {
      throw new NotFoundException('Template feature not found');
    }

    try {
      return await this.prisma.planTemplateFeature.update({
        where: { id: templateFeature.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          feature: true,
          planTemplate: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update template feature');
    }
  }

  async removeFeatureFromTemplate(templateId: string, featureId: string) {
    // Check if template feature exists
    const templateFeature = await this.prisma.planTemplateFeature.findFirst({
      where: {
        planTemplateId: templateId,
        featureId: featureId,
      },
    });

    if (!templateFeature) {
      throw new NotFoundException('Template feature not found');
    }

    try {
      return await this.prisma.planTemplateFeature.delete({
        where: { id: templateFeature.id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to remove feature from template');
    }
  }
} 