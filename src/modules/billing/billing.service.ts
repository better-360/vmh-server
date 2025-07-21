import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { StripeService } from '../stripe/stripe.service';
import { AddonDto } from 'src/dtos/check-out.dto';

// Temporary types until DTO exports are fixed
enum OrderStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING', 
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
}

enum OrderItemType {
  PLAN = 'PLAN',
  ADDON = 'ADDON',
  PRODUCT = 'PRODUCT',
}

interface CreateOrderItemDto {
  itemType: OrderItemType;
  itemId: string;
  variantId?: string;
  quantity?: number;
}

interface CreateOrderDto {
  email: string;
  userId?: string;
  currency?: string;
  items: CreateOrderItemDto[];
  metadata?: any;
}

interface OrderResponseDto {
  id: string;
  email: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeClientSecret?: string;
  userId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  items: any[];
}
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class BillingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async handleCheckOutSessionCompleted(sessionId: string) {
    // 1. Stripe'dan Checkout Session verilerini al
    const session = await this.stripeService.retrieveCheckoutSession(sessionId);
    if (session.metadata.paymentType === 'singleItemPurchase') {
      console.log('Single item purchase detected');
     // return this.handleSingleItemPurchaseCheckoutCompleted(session);
    }
  }

  // =====================
  // ORDER MANAGEMENT
  // =====================

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
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
         currency: createOrderDto.currency || 'USD',
         metadata: {
           orderType: 'subscription',
           customerEmail: createOrderDto.email,
           itemCount: createOrderDto.items.length.toString(),
         },
       });

       // Create Order in database
       const order = await this.prismaService.order.create({
         data: {
           email: createOrderDto.email,
           totalAmount,
           currency: createOrderDto.currency || 'USD',
           stripePaymentIntentId: paymentIntent.id,
           stripeClientSecret: paymentIntent.client_secret,
          userId: createOrderDto.userId,
          metadata: createOrderDto.metadata,
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
        if (!item.variantId) {
          throw new HttpException('Variant ID is required for addon items', HttpStatus.BAD_REQUEST);
        }
        const addonVariant = await this.prismaService.addonVariant.findUnique({
          where: { id: item.variantId },
          include: { addon: true },
        });
        if (!addonVariant) {
          throw new NotFoundException(`Addon variant with id ${item.variantId} not found`);
        }
        return {
          itemType: item.itemType,
          itemId: item.itemId,
          variantId: item.variantId,
          quantity,
          unitPrice: addonVariant.price,
          totalPrice: addonVariant.price * quantity,
          currency: addonVariant.currency,
          itemName: `${addonVariant.addon.name} - ${addonVariant.name}`,
          itemDescription: addonVariant.description,
        };

      case OrderItemType.PRODUCT:
        // Implement product logic here if needed
        throw new HttpException('Product type not implemented yet', HttpStatus.NOT_IMPLEMENTED);

      default:
        throw new HttpException('Invalid item type', HttpStatus.BAD_REQUEST);
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
        variantId: item.variantId,
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

  // =====================
  // LEGACY COMPATIBILITY
  // =====================

  async calculateCheckout(planPriceId: string, addons: AddonDto[] = []) {
    try {
      //Check if the plan price exists
      const planPrice = await this.prismaService.planPrice.findUnique({
        where: { id: planPriceId },
        include: { plan: true },
      });
      if (!planPrice) {
        throw new NotFoundException('Plan price not found');
      }

      let totalAmount = planPrice.amount; // Plan fiyatını başlangıç olarak al
      const calculatedAddons = [];

      // Check all addons are valid and calculate prices
      if (addons && addons.length > 0) {
        for (const addon of addons) {
          // Addon'ın varlığını kontrol et
          const validAddon = await this.prismaService.addon.findUnique({
            where: { id: addon.productId },
            include: { variants: true },
          });

          if (!validAddon) {
            throw new NotFoundException(`Addon with id ${addon.productId} not found`);
          }

          // Eğer selectedPriceId varsa, o variant'ı bul
          if (addon.selectedPriceId) {
            const selectedVariant = validAddon.variants.find(
              variant => variant.id === addon.selectedPriceId && !variant.isDeleted
            );
            
            if (!selectedVariant) {
              throw new NotFoundException(
                `Variant with id ${addon.selectedPriceId} not found for addon ${validAddon.name}`
              );
            }

            totalAmount += selectedVariant.price;
            calculatedAddons.push({
              addonId: validAddon.id,
              addonName: validAddon.name,
              variantId: selectedVariant.id,
              variantName: selectedVariant.name,
              price: selectedVariant.price,
              currency: selectedVariant.currency,
            });
          } else {
            // Eğer selectedPriceId yoksa, default variant'ı kullan (ilk aktif variant)
            const defaultVariant = validAddon.variants.find(variant => !variant.isDeleted);
            
            if (!defaultVariant) {
              throw new NotFoundException(`No active variant found for addon ${validAddon.name}`);
            }

            totalAmount += defaultVariant.price;
            calculatedAddons.push({
              addonId: validAddon.id,
              addonName: validAddon.name,
              variantId: defaultVariant.id,
              variantName: defaultVariant.name,
              price: defaultVariant.price,
              currency: defaultVariant.currency,
            });
          }
        }
      }

      return {
        amount: totalAmount,
        currency: planPrice.currency || 'USD',
        planDetails: {
          id: planPrice.id,
          name: planPrice.plan.name,
          price: planPrice.amount,
        },
        addons: calculatedAddons,
        totalAmount,
      };

    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to calculate checkout',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async handleComplete(){
  //   await this.subscriptionService.createWorkspaceSubscription();
  // }
}
