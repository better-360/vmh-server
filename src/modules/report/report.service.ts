import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FeatureUsageQueryDto } from 'src/dtos/plan.dto';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class ReportService {
    private logger = new Logger('PrismaService');
  constructor(private readonly prisma: PrismaService,
  ) {}
    async getFeatureUsages(query?: FeatureUsageQueryDto) {
      const {
        userId,
        officeLocationId,
        featureId,
        usedAt,
        page = 1,
        limit = 10,
      } = query || {};
  
      const skip = (page - 1) * limit;
      const where: Prisma.WorkspaceFeatureUsageWhereInput = {
        ...(userId && { userId }),
        ...(officeLocationId && { officeLocationId }),
        ...(featureId && { featureId }),
        ...(usedAt && { usedAt: { gte: usedAt, lt: new Date(usedAt.getFullYear(), usedAt.getMonth() + 1, 1) } }),
      };
  
      const [usages, total] = await Promise.all([
        this.prisma.workspaceFeatureUsage.findMany({
          where,
          skip,
          take: limit,
          include: {
            workspace: {
              select: { id: true, name: true, isActive: true },
            },
            officeLocation: {
              select: { id: true, label: true, addressLine: true, city: true },
            },
            feature: {
              select: { id: true, name: true, description: true },
            },
          },
          orderBy: { usedAt: 'desc' },
        }),
        this.prisma.workspaceFeatureUsage.count({ where }),
      ]);
  
      return {
        data: usages,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }


    async getFeatureUsageById(id: string) {
        const usage = await this.prisma.workspaceFeatureUsage.findFirst({
          where: { id },
          include: {
            workspace: {
              select: { id: true, name: true, isActive: true },
            },
            officeLocation: true,
            feature: true,
          },
        });
    
        if (!usage) {
          throw new NotFoundException('Feature usage not found');
        }
    
        return usage;
      }
    

  async getOfficeFeatureUsageForMonth(officeLocationId: string, month: Date) {
      return await this.prisma.workspaceFeatureUsage.findMany({
      where: {
        officeLocationId,
        usedAt: {
          gte: month,
          lt: new Date(month.getFullYear(), month.getMonth() + 1, 1),
        },
      },
      include: {
        workspace: {
          select: { id: true, name: true, isActive: true },
        },
        feature: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { usedCount: 'desc' },
    });
  }


} 