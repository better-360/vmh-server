import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import Stripe from 'stripe';
import { StripeService } from '../stripe/stripe.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateOrderDto, CreateOrderItemDto, OrderItemType, OrderResponseDto, OrderStatus } from 'src/dtos/checkout.dto';

@Injectable()
export class BillingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionService: SubscriptionService,
  ) { }

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
        // Implement product logic here needed
        throw new HttpException('Product type not implemented yet', HttpStatus.NOT_IMPLEMENTED);
      default:
        throw new HttpException('Invalid item type', HttpStatus.BAD_REQUEST);
    }
  }

  async createInitialSubscriptionOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
      let totalAmount = 0;
      const orderItems = [];
      // Calculate each item and prepare order items
      for (const item of createOrderDto.items) {
        const itemData = await this.calculateOrderItem(item);
        totalAmount += itemData.totalPrice;
        orderItems.push(itemData);
      }
      // Create Stripe Payment Intent
      const customerId = await this.stripeService.findOrCreateStripeCustomer(createOrderDto.email);
      const paymentIntent = await this.stripeService.createPaymentIntentForOrder({
        amount: totalAmount,
        currency: 'USD',
        customer: customerId,
        metadata: {
          orderType: 'initialSubscription',
          customerEmail: createOrderDto.email,
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
    const order = await this.prismaService.order.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        items: true,
        user: true,
      },
    });

    return order ? this.mapOrderToResponseDto(order) : null;
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

  // =====================
  // STRIPE WEBHOOK HANDLERS
  // =====================

  async handleStripePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      const order = await this.getOrderByPaymentIntentId(paymentIntent.id);
      if (order) {
        await this.updateOrderStatus(order.id, OrderStatus.PAYMENT_SUCCEEDED);

        // Process order completion (create subscriptions, etc.)
        await this.processOrderCompletion(order);
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
    } catch (error) {
      console.error('Error handling payment intent failed:', error);
    }
  }

  private async processOrderCompletion(order: OrderResponseDto) {
    // Process each order item
    for (const item of order.items) {
      if (item.itemType === OrderItemType.PLAN) {
        // Create workspace subscription for plan
        if (order.userId) {
          // TODO: Update createWorkspaceSubscription to accept these parameters
          // await this.subscriptionService.createWorkspaceSubscription();
          console.log(`Creating subscription for user ${order.userId} with plan ${item.itemId}`);
        }
      }
      // Handle other item types as needed
    }
  }


  async handleCheckOutSessionCompleted(sessionId: string) {
    // 1. Stripe'dan Checkout Session verilerini al
    const session = await this.stripeService.retrieveCheckoutSession(sessionId);
    if (session.metadata.paymentType === 'singleItemPurchase') {
      console.log('Single item purchase detected');
      // return this.handleSingleItemPurchaseCheckoutCompleted(session);
    }
  }


  async createOrder(createOrderDto: CreateOrderDto, userId: string, workspaceId: string): Promise<OrderResponseDto> {
    try {
      let totalAmount = 0;
      const orderItems = [];
      // Calculate each item and prepare order items
      for (const item of createOrderDto.items) {
        const itemData = await this.calculateOrderItem(item);
        totalAmount += itemData.totalPrice;
        orderItems.push(itemData);
      }
      // Create Stripe Payment Intent
      const paymentIntent = await this.stripeService.createPaymentIntentForOrder({
        amount: totalAmount,
        currency: 'USD',
        metadata: {
          orderType: 'initialSubscription',
          customerEmail: createOrderDto.email,
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


}
