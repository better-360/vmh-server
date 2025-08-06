import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, SubscriptionItemStatus, ProductType, BillingCycle } from '@prisma/client';

export interface CreateSubscriptionItemDto {
  mailboxId: string;
  itemType: ProductType;
  itemId: string;
  priceId?: string;
  billingCycle?: BillingCycle;
  quantity?: number;
  unitPrice: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
  itemName: string;
  itemDescription?: string;
}

export interface UpdateSubscriptionItemDto {
  quantity?: number;
  unitPrice?: number;
  endDate?: Date;
  status?: SubscriptionItemStatus;
  isActive?: boolean;
}

export interface SubscriptionItemQueryDto {
  mailboxId?: string;
  itemType?: ProductType;
  status?: SubscriptionItemStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class SubscriptionService {
  private logger = new Logger('SubscriptionService');

  constructor(private readonly prisma: PrismaService) {}
  
  // =====================
  // SUBSCRIPTION ITEM OPERATIONS
  // =====================

  async getSubscriptionItems(query?: SubscriptionItemQueryDto) {
    const {
      mailboxId,
      itemType,
      status,
      isActive = true,
      page = 1,
      limit = 10,
    } = query || {};

    const skip = (page - 1) * limit;
    const where: Prisma.SubscriptionItemWhereInput = {
      isActive,
      ...(mailboxId && { mailboxId }),
      ...(itemType && { itemType }),
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.subscriptionItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          mailbox: {
            include: {
              workspace: {
                select: { id: true, name: true, isActive: true },
              },
              officeLocation: {
                select: { id: true, label: true, addressLine: true, city: true, state: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscriptionItem.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubscriptionItemById(id: string) {
    const item = await this.prisma.subscriptionItem.findFirst({
      where: { id, isActive: true },
      include: {
        mailbox: {
          include: {
            workspace: {
              select: { id: true, name: true, isActive: true },
            },
            officeLocation: {
              select: { id: true, label: true, addressLine: true, city: true, state: true },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Subscription item with ID ${id} not found`);
    }

    return item;
  }

  async getSubscriptionItemsByMailbox(mailboxId: string, query?: Omit<SubscriptionItemQueryDto, 'mailboxId'>) {
    return this.getSubscriptionItems({ ...query, mailboxId });
  }

  // =====================
  // CREATE SUBSCRIPTION ITEM
  // =====================

  async createSubscriptionItem(createDto: CreateSubscriptionItemDto) {
    try {
      // Validate mailbox exists
      const mailbox = await this.prisma.mailbox.findFirst({
        where: { id: createDto.mailboxId, isActive: true },
      });

      if (!mailbox) {
        throw new NotFoundException(`Mailbox with ID ${createDto.mailboxId} not found`);
      }

      // Calculate total price
      const quantity = createDto.quantity || 1;
      const totalPrice = createDto.unitPrice * quantity;

      const item = await this.prisma.subscriptionItem.create({
        data: {
          mailboxId: createDto.mailboxId,
          itemType: createDto.itemType,
          itemId: createDto.itemId,
          priceId: createDto.priceId,
          billingCycle: createDto.billingCycle || BillingCycle.MONTHLY,
          quantity,
          unitPrice: createDto.unitPrice,
          totalPrice,
          currency: createDto.currency || 'USD',
          startDate: createDto.startDate,
          endDate: createDto.endDate,
          itemName: createDto.itemName,
          itemDescription: createDto.itemDescription,
          status: SubscriptionItemStatus.ACTIVE,
          isActive: true,
        },
        include: {
          mailbox: {
            include: {
              workspace: true,
              officeLocation: true,
            },
          },
        },
      });

      this.logger.log(`Created subscription item ${item.id} for mailbox ${createDto.mailboxId}`);
      return item;
    } catch (error) {
      this.logger.error(`Failed to create subscription item: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create subscription item');
    }
  }

  // =====================
  // UPDATE SUBSCRIPTION ITEM
  // =====================

  async updateSubscriptionItem(id: string, updateDto: UpdateSubscriptionItemDto) {
    try {
      const existingItem = await this.prisma.subscriptionItem.findFirst({
        where: { id, isActive: true },
      });

      if (!existingItem) {
        throw new NotFoundException(`Subscription item with ID ${id} not found`);
      }

      // Recalculate total price if quantity or unit price changed
      const quantity = updateDto.quantity ?? existingItem.quantity;
      const unitPrice = updateDto.unitPrice ?? existingItem.unitPrice;
      const totalPrice = quantity * unitPrice;

      const updatedItem = await this.prisma.subscriptionItem.update({
        where: { id },
        data: {
          ...updateDto,
          ...(updateDto.quantity !== undefined && { quantity }),
          ...(updateDto.unitPrice !== undefined && { unitPrice }),
          totalPrice,
          updatedAt: new Date(),
        },
        include: {
          mailbox: {
            include: {
              workspace: true,
              officeLocation: true,
            },
          },
        },
      });

      this.logger.log(`Updated subscription item ${id}`);
      return updatedItem;
    } catch (error) {
      this.logger.error(`Failed to update subscription item ${id}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update subscription item');
    }
  }

  // =====================
  // DELETE/DEACTIVATE SUBSCRIPTION ITEM
  // =====================

  async deactivateSubscriptionItem(id: string) {
    try {
      const existingItem = await this.prisma.subscriptionItem.findFirst({
        where: { id, isActive: true },
      });

      if (!existingItem) {
        throw new NotFoundException(`Subscription item with ID ${id} not found`);
      }

      const deactivatedItem = await this.prisma.subscriptionItem.update({
        where: { id },
        data: {
          isActive: false,
          status: SubscriptionItemStatus.CANCELLED,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Deactivated subscription item ${id}`);
      return deactivatedItem;
    } catch (error) {
      this.logger.error(`Failed to deactivate subscription item ${id}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to deactivate subscription item');
    }
  }

  async deleteSubscriptionItem(id: string) {
    try {
      const existingItem = await this.prisma.subscriptionItem.findFirst({
        where: { id, isActive: true },
      });

      if (!existingItem) {
        throw new NotFoundException(`Subscription item with ID ${id} not found`);
      }

      await this.prisma.subscriptionItem.delete({
        where: { id },
      });

      this.logger.log(`Deleted subscription item ${id}`);
      return { message: 'Subscription item deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete subscription item ${id}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete subscription item');
    }
  }

  // =====================
  // BULK OPERATIONS
  // =====================

  async bulkUpdateSubscriptionItems(mailboxId: string, updateDto: Partial<UpdateSubscriptionItemDto>) {
    try {
      const result = await this.prisma.subscriptionItem.updateMany({
        where: { mailboxId, isActive: true },
        data: {
          ...updateDto,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Bulk updated ${result.count} subscription items for mailbox ${mailboxId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to bulk update subscription items for mailbox ${mailboxId}: ${error.message}`);
      throw new BadRequestException('Failed to bulk update subscription items');
    }
  }

  async deactivateAllSubscriptionItems(mailboxId: string) {
    return this.bulkUpdateSubscriptionItems(mailboxId, {
      isActive: false,
      status: SubscriptionItemStatus.CANCELLED,
    });
  }

  // =====================
  // STATISTICS
  // =====================

  async getSubscriptionItemStatistics(mailboxId?: string) {
    const where: Prisma.SubscriptionItemWhereInput = {
      isActive: true,
      ...(mailboxId && { mailboxId }),
    };

    const [
      totalItems,
      activeItems,
      inactiveItems,
      totalRevenue,
      itemsByType,
      itemsByStatus,
    ] = await Promise.all([
      this.prisma.subscriptionItem.count({ where }),
      this.prisma.subscriptionItem.count({ 
        where: { ...where, status: SubscriptionItemStatus.ACTIVE } 
      }),
      this.prisma.subscriptionItem.count({ 
        where: { ...where, status: SubscriptionItemStatus.INACTIVE } 
      }),
      this.prisma.subscriptionItem.aggregate({
        where,
        _sum: { totalPrice: true },
      }),
      this.prisma.subscriptionItem.groupBy({
        by: ['itemType'],
        where,
        _count: { id: true },
      }),
      this.prisma.subscriptionItem.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    return {
      totalItems,
      activeItems,
      inactiveItems,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      itemsByType: itemsByType.map(item => ({
        type: item.itemType,
        count: item._count.id,
      })),
      itemsByStatus: itemsByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
      })),
    };
  }

  // =====================
  // HELPER METHODS
  // =====================

  async validateMailboxExists(mailboxId: string) {
    const mailbox = await this.prisma.mailbox.findFirst({
      where: { id: mailboxId, isActive: true },
    });

    if (!mailbox) {
      throw new NotFoundException(`Mailbox with ID ${mailboxId} not found`);
    }

    return mailbox;
  }

  async getActiveSubscriptionItemsForMailbox(mailboxId: string) {
    return this.prisma.subscriptionItem.findMany({
      where: {
        mailboxId,
        isActive: true,
        status: SubscriptionItemStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}