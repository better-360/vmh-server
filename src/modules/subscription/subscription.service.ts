import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateInitialSubscriptionDto,
  AddItemToSubscriptionDto,
  UpdateWorkspaceSubscriptionDto,
  UpdateWorkspaceSubscriptionItemDto,
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
      status,
      isActive,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.WorkspaceSubscriptionWhereInput = {
      ...(workspaceId && { workspaceId }),
      ...(officeLocationId && { officeLocationId }),
      ...(status && { status }),
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
          items: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
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
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Workspace subscription not found');
    }

    return subscription;
  }

  async createInitialSubscription(data: CreateInitialSubscriptionDto) {
    try {
      // Check if workspace and office location exist
      const [workspace, officeLocation] = await Promise.all([
        this.prisma.workspace.findUnique({
          where: { id: data.workspaceId, isActive: true, isDeleted: false },
        }),
        this.prisma.officeLocation.findUnique({
          where: { id: data.officeLocationId, isActive: true, isDeleted: false },
        }),
      ]);

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      if (!officeLocation) {
        throw new NotFoundException('Office location not found');
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

      // Validate plan price
      const planPrice = await this.prisma.planPrice.findUnique({
        where: { id: data.planPriceId },
        include: { 
          plan: true
        },
      });

      if (!planPrice || !planPrice.plan) {
        throw new NotFoundException('Plan price not found');
      }

      // Check if plan belongs to the office location
      if (planPrice.plan.officeLocationId !== data.officeLocationId || 
          !planPrice.plan.isActive || planPrice.plan.isDeleted) {
        throw new NotFoundException('Plan not available for this office location');
      }

      // Calculate subscription end date based on plan's billing cycle
      const subscriptionEndDate = this.calculateEndDate(data.startDate, planPrice.billingCycle);

      // Validate additional items (addons/products)
      if (data.items && data.items.length > 0) {
        await this.validateSubscriptionItems(data.items, data.officeLocationId);
      }

      return await this.prisma.workspaceSubscription.create({
        data: {
          workspaceId: data.workspaceId,
          officeLocationId: data.officeLocationId,
          planId: planPrice.plan.id,
          planPriceId: data.planPriceId,
          billingCycle: planPrice.billingCycle,
          stripeSubscriptionId: data.stripeSubscriptionId,
          status: 'ACTIVE',
          startDate: data.startDate,
          endDate: subscriptionEndDate,
          items: {
            create: data.items?.map(item => ({
              itemType: item.itemType,
              itemId: item.itemId,
              variantId: item.variantId,
              billingCycle: item.billingCycle,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              currency: item.currency || 'USD',
              startDate: item.startDate,
              endDate: item.endDate,
              status: 'ACTIVE',
              itemName: item.itemName,
              itemDescription: item.itemDescription,
            })) || [],
          },
        },
        include: {
          workspace: {
            select: { id: true, name: true, isActive: true },
          },
          officeLocation: true,
          plan: true,
          planPrice: true,
          items: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create initial subscription: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create initial subscription');
    }
  }

  async addItemToSubscription(data: AddItemToSubscriptionDto) {
    try {
      // Check if subscription exists and is active
      const subscription = await this.prisma.workspaceSubscription.findFirst({
        where: { id: data.subscriptionId, isActive: true },
        include: { officeLocation: true },
      });

      if (!subscription) {
        throw new NotFoundException('Active subscription not found');
      }

      // Validate the item
      await this.validateSubscriptionItems([data.item], subscription.officeLocationId);

      // Add item to subscription
      const subscriptionItem = await this.prisma.workspaceSubscriptionItem.create({
        data: {
          subscriptionId: data.subscriptionId,
          itemType: data.item.itemType,
          itemId: data.item.itemId,
          variantId: data.item.variantId,
          billingCycle: data.item.billingCycle,
          quantity: data.item.quantity,
          unitPrice: data.item.unitPrice,
          totalPrice: data.item.totalPrice,
          currency: data.item.currency || 'USD',
          startDate: data.item.startDate,
          endDate: data.item.endDate,
          status: 'ACTIVE',
          itemName: data.item.itemName,
          itemDescription: data.item.itemDescription,
        },
      });

      return subscriptionItem;
    } catch (error) {
      this.logger.error(`Failed to add item to subscription: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add item to subscription');
    }
  }

  async updateWorkspaceSubscription(id: string, data: UpdateWorkspaceSubscriptionDto) {
    await this.getWorkspaceSubscriptionById(id); // Check if exists

    try {
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
          items: {
            orderBy: { createdAt: 'asc' },
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

  async updateWorkspaceSubscriptionItem(itemId: string, data: UpdateWorkspaceSubscriptionItemDto) {
    try {
      // Check if item exists
      const existingItem = await this.prisma.workspaceSubscriptionItem.findUnique({
        where: { id: itemId },
      });

      if (!existingItem) {
        throw new NotFoundException('Subscription item not found');
      }

      return await this.prisma.workspaceSubscriptionItem.update({
        where: { id: itemId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update subscription item: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update subscription item');
    }
  }

  async cancelWorkspaceSubscription(id: string) {
    await this.getWorkspaceSubscriptionById(id); // Check if exists

    try {
      // Cancel subscription and all its items
      const [subscription] = await Promise.all([
        this.prisma.workspaceSubscription.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            isActive: false,
            endDate: new Date(),
            updatedAt: new Date(),
          },
        }),
        this.prisma.workspaceSubscriptionItem.updateMany({
          where: { subscriptionId: id },
          data: {
            status: 'CANCELLED',
            isActive: false,
            updatedAt: new Date(),
          },
        }),
      ]);

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel workspace subscription: ${error.message}`);
      throw new BadRequestException('Failed to cancel workspace subscription');
    }
  }

  async cancelSubscriptionItem(itemId: string) {
    try {
      const existingItem = await this.prisma.workspaceSubscriptionItem.findUnique({
        where: { id: itemId },
      });

      if (!existingItem) {
        throw new NotFoundException('Subscription item not found');
      }

      return await this.prisma.workspaceSubscriptionItem.update({
        where: { id: itemId },
        data: {
          status: 'CANCELLED',
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to cancel subscription item: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to cancel subscription item');
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
        items: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
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
        items: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =====================
  // HELPER METHODS
  // =====================

  private calculateEndDate(startDate: Date, billingCycle: any): Date {
    let endDate = new Date(startDate);
    
    switch (billingCycle) {
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'YEARLY':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'QUARTERLY':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'WEEKLY':
        endDate.setDate(endDate.getDate() + 7);
        break;
      default:
        endDate.setFullYear(endDate.getFullYear() + 999);
    }
    
    return endDate;
  }

  private async validateSubscriptionItems(items: any[], officeLocationId: string) {
    for (const item of items) {
      switch (item.itemType) {
        case 'PRODUCT':
          const product = await this.prisma.product.findFirst({
            where: { 
              id: item.itemId, 
              isDeleted: false 
            },
          });
          if (!product) {
            throw new NotFoundException(`Product not found: ${item.itemId}`);
          }
          
          // If variantId is provided, validate it
          if (item.variantId) {
            const variant = await this.prisma.productVariant.findFirst({
              where: { 
                id: item.variantId, 
                productId: item.itemId,
                isDeleted: false 
              },
            });
            if (!variant) {
              throw new NotFoundException(`Product variant not found: ${item.variantId}`);
            }
          }
          break;

        case 'ADDON':
          const addon = await this.prisma.addon.findFirst({
            where: { 
              id: item.itemId, 
              isActive: true,
              isDeleted: false 
            },
          });
          if (!addon) {
            throw new NotFoundException(`Addon not found: ${item.itemId}`);
          }
          
          // If variantId is provided, validate it
          if (item.variantId) {
            const variant = await this.prisma.addonVariant.findFirst({
              where: { 
                id: item.variantId, 
                addonId: item.itemId,
                isDeleted: false 
              },
            });
            if (!variant) {
              throw new NotFoundException(`Addon variant not found: ${item.variantId}`);
            }
          }
          break;

        default:
          throw new BadRequestException(`Invalid item type: ${item.itemType}`);
      }
    }
  }
}