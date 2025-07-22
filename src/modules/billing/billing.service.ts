import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import Stripe from 'stripe';
import { StripeService } from '../stripe/stripe.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateInitialSubscriptionOrderDto, CreateOrderDto, CreateOrderItemDto, OrderItemType, OrderResponseDto, OrderStatus } from 'src/dtos/checkout.dto';
import { LocationService } from '../catalog/location.service';
import { BillingCycle, OrderType } from '@prisma/client';
import { UserService } from '../user/user.service';
import { PlansService } from '../catalog/plans.service';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class BillingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionService: SubscriptionService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly planService: PlansService,
    private readonly workspaceService: WorkspaceService
  ) {}

  async createInitialSubscriptionOrder(createOrderDto: CreateInitialSubscriptionOrderDto): Promise<OrderResponseDto> {
    try {
      let totalAmount = 0;
      const orderItems = [];
      //Check one plan in the order and validate it
      const planpriceId=createOrderDto.items.find(item=>item.itemType==='PLAN').itemId;
      const planprice=await this.prismaService.planPrice.findUnique({
        where:{id:planpriceId},
        include:{plan:true}
      })

      if(!planprice){
        throw new NotFoundException('Plan not found');
      }
      // Calculate each item and prepare order items
      for (const item of createOrderDto.items) {
        const itemData = await this.calculateOrderItem(item);
        totalAmount += itemData.totalPrice;
        orderItems.push(itemData);
      }

      // Validate office location
      await this.locationService.getOfficeLocationById(createOrderDto.officeLocationId);
      const userFullName = `${createOrderDto.firstName} ${createOrderDto.lastName || ''}`.trim();
      const customerId = await this.stripeService.findOrCreateStripeCustomer(createOrderDto.email, userFullName);
      const paymentIntent = await this.stripeService.createPaymentIntentForOrder({
        amount: totalAmount,
        currency: 'USD',
        customer: customerId,
        metadata: {
          customerName: createOrderDto.firstName + ' ' + createOrderDto.lastName,
          orderType: 'initialSubscription',
          planPriceId: planpriceId,
          customerEmail: createOrderDto.email,
          officeLocationId: createOrderDto.officeLocationId,
          itemCount: createOrderDto.items.length.toString(),
          cart: JSON.stringify(createOrderDto.items),
        }
      });
      // Create Order in database
      const order = await this.prismaService.order.create({
        data: {
          email: createOrderDto.email,
          totalAmount,
          currency: 'USD',
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
          stripeCustomerId: customerId,
          type: OrderType.INITIAL_SUBSCRIPTION,
          metadata: {
            firstName: createOrderDto.firstName,
            lastName: createOrderDto.lastName,
            officeLocationId: createOrderDto.officeLocationId,
            planPriceId: planpriceId,
            planId: planprice.plan.id,
            billingCycle: planprice.billingCycle,
          },
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          user: true,
        },
      });
      const mappedOrder=this.mapOrderToResponseDto(order);
      console.log('mappedOrder',mappedOrder);
      return mappedOrder;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create order',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, completedAt?: Date): Promise<OrderResponseDto> {
    const order = await this.prismaService.order.update({
      where: { id: orderId },
      data: {
        status,
        completedAt: status === OrderStatus.PAYMENT_SUCCEEDED ? (completedAt || new Date()) : undefined,
      },
      include: {
        items: true,
        user: true,
      },
    });

    // Emit event for order status change
    this.eventEmitter.emit('order.status.updated', {
      orderId: order.id,
      status,
      email: order.email,
      totalAmount: order.totalAmount,
    });

    return this.mapOrderToResponseDto(order);
  }

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<OrderResponseDto | null> {
    const order = await this.prismaService.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        items: true,
        user: true,
      },
    });
    return order ? this.mapOrderToResponseDto(order) : null;
  }

  // =====================
  // STRIPE WEBHOOK HANDLERS
  // =====================

  async handleStripePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      const order = await this.getOrderByPaymentIntentId(paymentIntent.id);
      if (order) {
        await this.updateOrderStatus(order.id, OrderStatus.PAYMENT_SUCCEEDED);
        switch (order.type) {
          case OrderType.INITIAL_SUBSCRIPTION:
            await this.handleInitialSubscriptionOrder(order);
            break;
          default:
            console.log(`Unhandled order type: ${order.type}`);
        }
      }
    } catch (error) {
      console.error('Error handling payment intent succeeded:', error);
    }
  }

  async handleStripePaymentIntentPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      const order = await this.getOrderByPaymentIntentId(paymentIntent.id);
      if (order) {
        await this.updateOrderStatus(order.id, OrderStatus.PAYMENT_FAILED);
      }
      this.eventEmitter.emit('order.payment.failed', {
        orderId: order.id,
        email: order.email,
        totalAmount: order.totalAmount,
      });
    } catch (error) {
      console.error('Error handling payment intent failed:', error);
    }
  }

  async handleInitialSubscriptionOrder(order: OrderResponseDto) {
    try {
      const metadata = order.metadata as any;
      const firstName = metadata?.firstName;
      const lastName = metadata?.lastName;
      const officeLocationId = metadata?.officeLocationId;

      if (!firstName || !officeLocationId) {
        throw new BadRequestException('Missing required metadata for initial subscription');
      }

      // 1. Create user
      const newUser = await this.userService.createUser(order.email, firstName, lastName, order.stripeCustomerId);
      const workspace = newUser.workspaces[0];

      // 2. Create workspace address
       await this.workspaceService.createWorkspaceAddress(
        workspace.workspaceId,
        newUser.id,
        { 
          officeLocationId,
          isDefault: true
        }
      );

      // 3. Separate plan item from other items
      const planItem = order.items.find(item => item.itemType === 'PLAN');
      const otherItems = order.items.filter(item => item.itemType !== 'PLAN');

      if (!planItem) {
        throw new BadRequestException('No plan found in order items');
      }

      // 4. Prepare additional subscription items (addons/products)
      const subscriptionItems = await this.mapOrderItemsToSubscriptionItems(otherItems, officeLocationId);

      // 5. Create initial subscription using SubscriptionService
      const subscription = await this.subscriptionService.createInitialSubscription({
        workspaceId: workspace.workspaceId,
        officeLocationId,
        planPriceId: planItem.itemId, // Plan item'ın itemId'si plan price ID'si
        stripeSubscriptionId: null,
        startDate: new Date(),
        items: subscriptionItems
      });
      console.log(`Successfully created initial subscription for user ${newUser.email}:`, {
      workspaceId: workspace.workspaceId,
       subscriptionId: subscription.id,
         planItemId: planItem.itemId,
         additionalItemCount: subscriptionItems.length
       });

      return subscription;
    } catch (error) {
      console.error('Error handling initial subscription order:', error);
      throw new HttpException(error.message || 'Failed to create initial subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handleSubscriptionOrder(order: OrderResponseDto) {
    try {
      // For existing subscriptions - user should be logged in
      if (!order.userId) {
        throw new BadRequestException('User ID required for subscription orders');
      }
      const metadata = order.metadata as any;
      const workspaceId = metadata?.workspaceId;
      const officeLocationId = metadata?.officeLocationId;

      if (!workspaceId || !officeLocationId) {
        throw new BadRequestException('Missing workspace or office location metadata');
      }

      // Get existing subscription
      const existingSubscriptions = await this.subscriptionService.getWorkspaceActiveSubscriptions(workspaceId);
      const subscription = existingSubscriptions.find(sub => sub.officeLocationId === officeLocationId);

      if (!subscription) {
        throw new NotFoundException('No active subscription found for this workspace and office location');
      }

      // Add each order item to the subscription
      for (const orderItem of order.items) {
        const subscriptionItem = await this.mapOrderItemToSubscriptionItem(orderItem, officeLocationId);
        
        await this.subscriptionService.addItemToSubscription({
          subscriptionId: subscription.id,
          item: subscriptionItem
        });
      }

      console.log(`Successfully added ${order.items.length} items to subscription ${subscription.id}`);

    } catch (error) {
      console.error('Error handling subscription order:', error);
      throw error;
    }
  }
  // =====================
  // CREATE ORDER FOR EXISTING SUBSCRIPTION (ADD ITEM TO SUBSCRIPTION) REVIEW LATER FOR SUBSCRIPTION METHOD ON STRIPE
  // =====================
  async createOrder(dto: CreateOrderDto, userId: string, workspaceId: string): Promise<OrderResponseDto> {
    try {
      let totalAmount = 0;
      const orderItems = [];
      for (const item of dto.items) {
        const itemData = await this.calculateOrderItem(item);
        totalAmount += itemData.totalPrice;
        orderItems.push(itemData);
      }
      
      // Get user info for Stripe customer
      const user = await this.userService.findUserById(userId);
      const userFullName = `${user.firstName} ${user.lastName || ''}`.trim();
      const customerId = await this.stripeService.findOrCreateStripeCustomer(user.email, userFullName);

      // Create Stripe Payment Intent
      const paymentIntent = await this.stripeService.createPaymentIntentForOrder({
        amount: totalAmount,
        currency: 'USD',
        customer: customerId,
        metadata: {
          orderType: 'subscription',
          customerEmail: user.email,
          workspaceId,
          itemCount: dto.items.length.toString(),
          cart: JSON.stringify(dto.items),
        }
      });
      
      // Create Order in database
      const order = await this.prismaService.order.create({
        data: {
          email: user.email,
          totalAmount,
          currency: 'USD',
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
          stripeCustomerId: customerId,
          userId,
          type: OrderType.SUBSCRIPTION,
          metadata: {
            workspaceId,
            subscriptionId: dto.subscriptionId,
          },
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          user: true,
        },
      });
      
      return this.mapOrderToResponseDto(order);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create order',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================
  // HELPER METHODS
  // =====================

  private async mapOrderItemsToSubscriptionItems(orderItems: any[], officeLocationId: string) {
    const subscriptionItems = [];

    for (const orderItem of orderItems) {
      const subscriptionItem = await this.mapOrderItemToSubscriptionItem(orderItem, officeLocationId);
      subscriptionItems.push(subscriptionItem);
    }

    return subscriptionItems;
  }

  private async mapOrderItemToSubscriptionItem(orderItem: any, officeLocationId: string) {
    const startDate = new Date();
    let endDate: Date | undefined;
    let billingCycle: BillingCycle;

    switch (orderItem.itemType) {
      case OrderItemType.ADDON:
        const addonVariant = await this.prismaService.addonVariant.findUnique({
          where: { id: orderItem.itemId },
          include: { addon: true }
        });
        
        if (!addonVariant) {
          throw new NotFoundException(`Addon variant not found: ${orderItem.itemId}`);
        }

        billingCycle = addonVariant.billingCycle;
        endDate = this.calculateEndDate(startDate, billingCycle);

        return {
          itemType: 'ADDON' as const,
          itemId: addonVariant.addonId,
          variantId: orderItem.itemId,
          billingCycle,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          totalPrice: orderItem.totalPrice,
          currency: orderItem.currency,
          startDate,
          endDate,
          itemName: orderItem.itemName,
          itemDescription: orderItem.itemDescription,
        };

      case OrderItemType.PRODUCT:
        const productVariant = await this.prismaService.productVariant.findUnique({
          where: { id: orderItem.itemId },
          include: { product: true }
        });
        
        if (!productVariant) {
          throw new NotFoundException(`Product variant not found: ${orderItem.itemId}`);
        }

        billingCycle = productVariant.billingCycle;
        endDate = billingCycle === BillingCycle.ONE_TIME ? undefined : this.calculateEndDate(startDate, billingCycle);

        return {
          itemType: 'PRODUCT' as const,
          itemId: productVariant.productId,
          variantId: orderItem.itemId,
          billingCycle,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          totalPrice: orderItem.totalPrice,
          currency: orderItem.currency,
          startDate,
          endDate,
          itemName: orderItem.itemName,
          itemDescription: orderItem.itemDescription,
        };

      default:
        throw new BadRequestException(`Unsupported item type: ${orderItem.itemType}`);
    }
  }

  private calculateEndDate(startDate: Date, billingCycle: BillingCycle): Date {
    const endDate = new Date(startDate);
    
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case BillingCycle.YEARLY:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case BillingCycle.QUARTERLY:
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case BillingCycle.WEEKLY:
        endDate.setDate(endDate.getDate() + 7);
        break;
      default:
        // For ONE_TIME, return one year from now as fallback
        endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    return endDate;
  }

     private calculateSubscriptionEndDate(subscriptionItems: any[]): Date | undefined {
     // Find the latest end date among all items
     let latestEndDate: Date | undefined;

     for (const item of subscriptionItems) {
       if (item.endDate && (!latestEndDate || item.endDate > latestEndDate)) {
         latestEndDate = item.endDate;
       }
     }

     return latestEndDate;
   }

  private async calculateOrderItem(item: CreateOrderItemDto) {
    const quantity = item.quantity || 1;
    switch (item.itemType) {
      case OrderItemType.PLAN:
        const planPrice = await this.prismaService.planPrice.findUnique({
          where: { id: item.itemId },
          include: { plan: true },
        });
        if (!planPrice) {
          throw new NotFoundException(`Plan price with id ${item.itemId} not found`);
        }
        return {
          itemType: item.itemType,
          itemId: item.itemId,
          quantity,
          unitPrice: planPrice.amount,
          totalPrice: planPrice.amount * quantity,
          currency: planPrice.currency,
          itemName: planPrice.plan.name,
          itemDescription: planPrice.description || planPrice.plan.description,
        };

      case OrderItemType.ADDON:
        const addonVariant = await this.prismaService.addonVariant.findUnique({
          where: { id: item.itemId },
          include: { addon: true },
        });
        if (!addonVariant) {
          throw new NotFoundException(`Addon variant with id ${item.itemId} not found`);
        }
        return {
          itemType: item.itemType,
          itemId: item.itemId,
          quantity,
          unitPrice: addonVariant.price,
          totalPrice: addonVariant.price * quantity,
          currency: addonVariant.currency,
          itemName: `${addonVariant.addon.name} - ${addonVariant.name}`,
          itemDescription: addonVariant.description,
        };

      case OrderItemType.PRODUCT:
        const productVariant = await this.prismaService.productVariant.findUnique({
          where: { id: item.itemId },
          include: { product: true },
        });
        if (!productVariant) {
          throw new NotFoundException(`Product variant with id ${item.itemId} not found`);
        }
        return {
          itemType: item.itemType,
          itemId: item.itemId,
          quantity,
          unitPrice: productVariant.amount,
          totalPrice: productVariant.amount * quantity,
          currency: productVariant.currency,
          itemName: `${productVariant.product.name} - ${productVariant.name}`,
          itemDescription: productVariant.description,
        };

      default:
        throw new HttpException('Invalid item type', HttpStatus.BAD_REQUEST);
    }
  }

  private mapOrderToResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      email: order.email,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeCustomerId: order.stripeCustomerId,
      stripeClientSecret: order.stripeClientSecret,
      userId: order.userId,
      metadata: order.metadata,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      completedAt: order.completedAt,
      type: order.type,
      items: order.items.map(item => ({
        id: item.id,
        itemType: item.itemType,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        currency: item.currency,
        itemName: item.itemName,
        itemDescription: item.itemDescription,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }
}
