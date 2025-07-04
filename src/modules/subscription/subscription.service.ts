import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateWorkspaceSubscriptionDto,
  UpdateWorkspaceSubscriptionDto,
  WorkspaceSubscriptionQueryDto,
} from 'src/dtos/plan.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionService {
    private logger = new Logger('SubscriptionService');

  constructor(private readonly prisma: PrismaService) {}
  
    // =====================
    // WORKSPACE SUBSCRIPTION OPERATIONS
    // =====================
  
    async getWorkspaceSubscriptions(query?: WorkspaceSubscriptionQueryDto) {
      const {
        workspaceId,
        officeLocationId,
        planId,
        billingCycle,
        isActive,
        page = 1,
        limit = 10,
      } = query || {};
  
      const skip = (page - 1) * limit;
      const where: Prisma.WorkspaceSubscriptionWhereInput = {
        ...(workspaceId && { workspaceId }),
        ...(officeLocationId && { officeLocationId }),
        ...(planId && { planId }),
        ...(billingCycle && { billingCycle }),
        ...(isActive !== undefined && { isActive }),
      };
  
      const [subscriptions, total] = await Promise.all([
        this.prisma.workspaceSubscription.findMany({
          where,
          skip,
          take: limit,
          include: {
            workspace: {
              select: { id: true, name: true, isActive: true },
            },
            officeLocation: {
              select: { id: true, label: true, addressLine: true, city: true, state: true },
            },
            plan: {
              include: {
                officeLocation: {
                  select: { id: true, label: true, city: true, state: true },
                },
                prices: {
                  where: { isActive: true, isDeleted: false },
                  select: { id: true, amount: true, currency: true, billingCycle: true },
                },
                features: {
                  where: { isActive: true, isDeleted: false },
                  include: {
                    feature: {
                      select: { id: true, name: true, description: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.workspaceSubscription.count({ where }),
      ]);
  
      return {
        data: subscriptions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async getWorkspaceSubscriptionById(id: string) {
      const subscription = await this.prisma.workspaceSubscription.findFirst({
        where: { id },
        include: {
          workspace: {
            select: { id: true, name: true, isActive: true },
          },
          officeLocation: true,
          plan: {
            include: {
              officeLocation: {
                select: { id: true, label: true, city: true, state: true },
              },
              prices: {
                where: { isActive: true, isDeleted: false },
              },
              features: {
                where: { isActive: true, isDeleted: false },
                include: {
                  feature: true,
                },
              },
            },
          },
        },
      });

      if (!subscription) {
        throw new NotFoundException('Workspace subscription not found');
      }

      return subscription;
    }
  
    async createWorkspaceSubscription(data: CreateWorkspaceSubscriptionDto) {
      try {
        // Check if workspace, office location, and plan exist
        const [workspace, officeLocation, plan] = await Promise.all([
          this.prisma.workspace.findFirst({
            where: { id: data.workspaceId, isActive: true },
          }),
          this.prisma.officeLocation.findFirst({
            where: { id: data.officeLocationId, isActive: true },
          }),
          this.prisma.plan.findFirst({
            where: { 
              id: data.planId, 
              officeLocationId: data.officeLocationId,
              isActive: true, 
              isDeleted: false 
            },
            include: {
              prices: {
                where: { 
                  billingCycle: data.billingCycle,
                  isActive: true, 
                  isDeleted: false 
                },
              },
            },
          }),
        ]);
  
        if (!workspace) {
          throw new NotFoundException('Workspace not found');
        }
  
        if (!officeLocation) {
          throw new NotFoundException('Office location not found');
        }
  
        if (!plan) {
          throw new NotFoundException('Plan not found for this office location');
        }

        // Check if plan has pricing for the requested billing cycle
        if (plan.prices.length === 0) {
          throw new NotFoundException(`No pricing found for ${data.billingCycle} billing cycle`);
        }
  
        // Check if active subscription already exists for this office
        const existingSubscription = await this.prisma.workspaceSubscription.findFirst({
          where: {
            workspaceId: data.workspaceId,
            officeLocationId: data.officeLocationId,
            isActive: true,
          },
        });
  
        if (existingSubscription) {
          throw new ConflictException('Active subscription already exists for this office location');
        }
  
        return await this.prisma.workspaceSubscription.create({
          data,
          include: {
            workspace: {
              select: { id: true, name: true, isActive: true },
            },
            officeLocation: true,
            plan: {
              include: {
                prices: {
                  where: { isActive: true, isDeleted: false },
                },
                features: {
                  where: { isActive: true, isDeleted: false },
                  include: {
                    feature: true,
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        this.logger.error(`Failed to create workspace subscription: ${error.message}`);
        if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('Failed to create workspace subscription');
      }
    }
  
    async updateWorkspaceSubscription(id: string, data: UpdateWorkspaceSubscriptionDto) {
      await this.getWorkspaceSubscriptionById(id); // Check if exists
  
      try {
        // If planId is being updated, check if it exists and belongs to the same office location
        if (data.planId) {
          const currentSubscription = await this.prisma.workspaceSubscription.findUnique({
            where: { id },
            select: { officeLocationId: true },
          });

          const plan = await this.prisma.plan.findFirst({
            where: { 
              id: data.planId, 
              officeLocationId: currentSubscription.officeLocationId,
              isActive: true, 
              isDeleted: false 
            },
            include: {
              prices: {
                where: { 
                  ...(data.billingCycle && { billingCycle: data.billingCycle }),
                  isActive: true, 
                  isDeleted: false 
                },
              },
            },
          });
  
          if (!plan) {
            throw new NotFoundException('Plan not found for this office location');
          }

          // Check if plan has pricing for the requested billing cycle
          if (data.billingCycle && plan.prices.length === 0) {
            throw new NotFoundException(`No pricing found for ${data.billingCycle} billing cycle`);
          }
        }
  
        return await this.prisma.workspaceSubscription.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
          include: {
            workspace: {
              select: { id: true, name: true, isActive: true },
            },
            officeLocation: true,
            plan: {
              include: {
                prices: {
                  where: { isActive: true, isDeleted: false },
                },
                features: {
                  where: { isActive: true, isDeleted: false },
                  include: {
                    feature: true,
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        this.logger.error(`Failed to update workspace subscription: ${error.message}`);
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('Failed to update workspace subscription');
      }
    }
  
    async cancelWorkspaceSubscription(id: string) {
      await this.getWorkspaceSubscriptionById(id); // Check if exists
  
      try {
        return await this.prisma.workspaceSubscription.update({
          where: { id },
          data: {
            isActive: false,
            endDate: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.error(`Failed to cancel workspace subscription: ${error.message}`);
        throw new BadRequestException('Failed to cancel workspace subscription');
      }
    }
  
    async getActiveSubscriptionsForOffice(officeLocationId: string) {
      return await this.prisma.workspaceSubscription.findMany({
        where: {
          officeLocationId,
          isActive: true,
        },
        include: {
          workspace: {
            select: { id: true, name: true, isActive: true },
          },
          plan: {
            include: {
              prices: {
                where: { isActive: true, isDeleted: false },
              },
              features: {
                where: { isActive: true, isDeleted: false },
                include: {
                  feature: true,
                },
              },
            },
          },
        },
      });
    }
  
    async getWorkspaceActiveSubscriptions(workspaceId: string) {
      return await this.prisma.workspaceSubscription.findMany({
        where: {
          workspaceId,
          isActive: true,
        },
        include: {
          officeLocation: {
            select: { id: true, label: true, addressLine: true, city: true, state: true },
          },
          plan: {
            include: {
              prices: {
                where: { isActive: true, isDeleted: false },
              },
              features: {
                where: { isActive: true, isDeleted: false },
                include: {
                  feature: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
}