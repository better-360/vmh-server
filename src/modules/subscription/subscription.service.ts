import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateOfficeSubscriptionDto,
  UpdateOfficeSubscriptionDto,
  OfficeSubscriptionQueryDto,
} from 'src/dtos/plan.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionService {
    private logger = new Logger('PrismaService');

  constructor(private readonly prisma: PrismaService,
  ) {}
  
    // =====================
    // OFFICE SUBSCRIPTION OPERATIONS
    // =====================
  
    async getOfficeSubscriptions(query?: OfficeSubscriptionQueryDto) {
      const {
        userId,
        officeLocationId,
        planId,
        billingCycle,
        isActive,
        page = 1,
        limit = 10,
      } = query || {};
  
      const skip = (page - 1) * limit;
      const where: Prisma.UserSubscriptionWhereInput = {
        ...(userId && { userId }),
        ...(officeLocationId && { officeLocationId }),
        ...(planId && { planId }),
        ...(billingCycle && { billingCycle }),
        ...(isActive !== undefined && { isActive }),
      };
  
      const [subscriptions, total] = await Promise.all([
        this.prisma.userSubscription.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
            officeLocation: {
              select: { id: true, label: true, addressLine: true, city: true, state: true },
            },
            plan: {
              include: {
                plan: {
                  select: { id: true, name: true, description: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.userSubscription.count({ where }),
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
  
    async getOfficeSubscriptionById(id: string) {
      const subscription = await this.prisma.userSubscription.findFirst({
        where: { id },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          officeLocation: true,
          plan: {
            include: {
              plan: true,
            },
          },
        },
      });
  
      if (!subscription) {
        throw new NotFoundException('Office subscription not found');
      }
  
      return subscription;
    }
  
    async createOfficeSubscription(data: CreateOfficeSubscriptionDto) {
      try {
        // Check if user, office location, and plan exist
        const [user, officeLocation, planPrice] = await Promise.all([
          this.prisma.user.findFirst({
            where: { id: data.userId, isActive: true },
          }),
          this.prisma.officeLocation.findFirst({
            where: { id: data.officeLocationId, isActive: true },
          }),
          this.prisma.planPrice.findFirst({
            where: { id: data.planId, isActive: true, isDeleted: false },
            include: { plan: true },
          }),
        ]);
  
        if (!user) {
          throw new NotFoundException('User not found');
        }
  
        if (!officeLocation) {
          throw new NotFoundException('Office location not found');
        }
  
        if (!planPrice) {
          throw new NotFoundException('Plan price not found');
        }
  
        // Check if billing cycle matches
        if (planPrice.billingCycle !== data.billingCycle) {
          throw new BadRequestException('Billing cycle does not match plan price');
        }
  
        // Check if active subscription already exists for this office
        const existingSubscription = await this.prisma.userSubscription.findFirst({
          where: {
            userId: data.userId,
            officeLocationId: data.officeLocationId,
            isActive: true,
          },
        });
  
        if (existingSubscription) {
          throw new ConflictException('Active subscription already exists for this office location');
        }
  
        return await this.prisma.userSubscription.create({
          data,
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
            officeLocation: true,
            plan: {
              include: { plan: true },
            },
          },
        });
      } catch (error) {
        this.logger.error(`Failed to create office subscription: ${error.message}`);
        if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('Failed to create office subscription');
      }
    }
  
    async updateOfficeSubscription(id: string, data: UpdateOfficeSubscriptionDto) {
      await this.getOfficeSubscriptionById(id); // Check if exists
  
      try {
        // If planId is being updated, check if it exists
        if (data.planId) {
          const planPrice = await this.prisma.planPrice.findFirst({
            where: { id: data.planId, isActive: true, isDeleted: false },
          });
  
          if (!planPrice) {
            throw new NotFoundException('Plan price not found');
          }
  
          // Check if billing cycle matches if both are provided
          if (data.billingCycle && planPrice.billingCycle !== data.billingCycle) {
            throw new BadRequestException('Billing cycle does not match plan price');
          }
        }
  
        return await this.prisma.userSubscription.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
            officeLocation: true,
            plan: {
              include: { plan: true },
            },
          },
        });
      } catch (error) {
        this.logger.error(`Failed to update office subscription: ${error.message}`);
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('Failed to update office subscription');
      }
    }
  
    async cancelOfficeSubscription(id: string) {
      await this.getOfficeSubscriptionById(id); // Check if exists
  
      try {
        return await this.prisma.userSubscription.update({
          where: { id },
          data: {
            isActive: false,
            endDate: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.error(`Failed to cancel office subscription: ${error.message}`);
        throw new BadRequestException('Failed to cancel office subscription');
      }
    }
  
    async getActiveSubscriptionsForOffice(officeLocationId: string) {
      return await this.prisma.userSubscription.findMany({
        where: {
          officeLocationId,
          isActive: true,
        },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          plan: {
            include: { plan: true },
          },
        },
      });
    }
  
    async getUserOfficeSubscriptions(userId: string) {
      return await this.prisma.userSubscription.findMany({
        where: {
          userId,
          isActive: true,
        },
        include: {
          officeLocation: {
            select: { id: true, label: true, addressLine: true, city: true, state: true },
          },
          plan: {
            include: { plan: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
}