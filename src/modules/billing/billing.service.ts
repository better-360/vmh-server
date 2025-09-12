import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionService } from '../subscription/subscription.service';
import { LocationService } from '../catalog/location.service';
import { UserService } from '../user/user.service';
import { PlansService } from '../catalog/plans.service';
import { WorkspaceService } from '../workspace/workspace.service';

// DTO & enums (inputlar TS; diğerleri sade)
import {
  CreateInitialSubscriptionOrderDto,
  CreateOrderDto,
  CreateOrderItemDto,
  OrderResponseDto,
  OrderStatus,
  OrderItemType,
} from 'src/dtos/checkout.dto';

import { BillingCycle, OrderType } from '@prisma/client';
import { ContextDto } from 'src/dtos/user.dto';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionService: SubscriptionService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly planService: PlansService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  /**
   * INITIAL SUBSCRIPTION (guest checkout)
   * - one required plan (planPriceId)
   * - optional addons: string[] (priceId list)
   */
  async createInitialSubscriptionOrder(
    dto: CreateInitialSubscriptionOrderDto,
  ): Promise<OrderResponseDto> {
    try {
      // 0) Office location validation
      await this.locationService.getLocationById(dto.officeLocationId);

      // 1) Plan lookup (required)
      const planPrice = await this.prisma.planPrice.findUnique({
        where: { id: dto.planPriceId },
        include: { plan: true },
      });
      if (!planPrice) throw new NotFoundException('Plan price not found');

      // 2) Addons lookup (optional)
      const { addonItems, addonsTotal } = await this.buildAddonItems(dto.addons || []);

      // 3) Plan item map
      const planItem = this.mapPlanToOrderItem(planPrice);

      // 4) Sum totals
      const totalAmount = planItem.totalPrice + addonsTotal;
      if (totalAmount <= 0) {
        throw new BadRequestException('Order total must be greater than zero');
      }

      // 5) Stripe customer
      const fullName = `${dto.firstName} ${dto.lastName || ''}`.trim();
      const customerId = await this.stripeService.findOrCreateStripeCustomer(dto.email, fullName);

      // 6) Stripe Checkout Session
      const sessionData = {
        amount: totalAmount, // cents
        currency: planPrice.currency || 'USD',
        customer: customerId,
        successUrl: 'https://vmh.thedice.ai/completion',
        cancelUrl: 'https://vmh.thedice.ai/completion',
        metadata: {
          orderType: 'initialSubscription',
          customerName: fullName,
          customerEmail: dto.email,
          officeLocationId: dto.officeLocationId,
          planPriceId: dto.planPriceId,
          planId: planPrice.plan.id,
          billingCycle: planPrice.billingCycle,
          addonIds: JSON.stringify(dto.addons || []),
          itemCount: (1 + (dto.addons?.length || 0)).toString(),
        },
      };
      const checkoutSession = await this.stripeService.createCheckoutSessionForOrder(sessionData);

      // 7) Persist Order + Items
      const order = await this.prisma.order.create({
        data: {
          email: dto.email,
          totalAmount,
          currency: planPrice.currency || 'USD',
          stripeSessionId: checkoutSession.id,
          stripePaymentIntentId: checkoutSession.payment_intent as string,
          stripeCustomerId: customerId,
          type: OrderType.INITIAL_SUBSCRIPTION,
          metadata: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            officeLocationId: dto.officeLocationId,
            planPriceId: dto.planPriceId,
            planId: planPrice.plan.id,
            billingCycle: planPrice.billingCycle,
            addonIds: dto.addons || [],
            successUrl: 'https://vmh.thedice.ai/completion',
            cancelUrl: 'https://vmh.thedice.ai/completion',
            stripeCheckoutUrl: checkoutSession.url,
          },
          items: {
            create: [planItem, ...addonItems],
          },
        },
        include: { items: true },
      });

      return this.mapOrderToResponseDto(order);
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to create order',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * UPDATE ORDER STATUS (webhook flow)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    completedAt?: Date,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        completedAt:
          status === OrderStatus.PAYMENT_SUCCEEDED
            ? completedAt || new Date()
            : undefined,
      },
      include: { items: true },
    });

    this.eventEmitter.emit('order.status.updated', {
      orderId: order.id,
      status,
      email: order.email,
      totalAmount: order.totalAmount,
    });

    return this.mapOrderToResponseDto(order);
  }

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<OrderResponseDto | null> {
    const order = await this.prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { items: true },
    });
    return order ? this.mapOrderToResponseDto(order) : null;
  }

  async getOrderBySessionId(sessionId: string): Promise<OrderResponseDto | null> {
    const order = await this.prisma.order.findFirst({
      where: { stripeSessionId: sessionId },
      include: { items: true },
    });
    return order ? this.mapOrderToResponseDto(order) : null;
  }

  /**
   * STRIPE WEBHOOK HANDLERS
   */
  async handleStripePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      const order = await this.getOrderByPaymentIntentId(paymentIntent.id);
      if (!order) return;

      await this.updateOrderStatus(order.id, OrderStatus.PAYMENT_SUCCEEDED);

      switch (order.type) {
        case OrderType.INITIAL_SUBSCRIPTION:
          await this.handleInitialSubscriptionOrder(order);
          break;
        default:
          // extend for other order types if needed
          break;
      }
    } catch (e) {
      console.error('Error handling payment intent succeeded:', e);
    }
  }

  async handleStripePaymentIntentPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      const order = await this.getOrderByPaymentIntentId(paymentIntent.id);
      if (order) {
        await this.updateOrderStatus(order.id, OrderStatus.PAYMENT_FAILED);
        this.eventEmitter.emit('order.payment.failed', {
          orderId: order.id,
          email: order.email,
          totalAmount: order.totalAmount,
        });
      }
    } catch (e) {
      console.error('Error handling payment intent failed:', e);
    }
  }

  async handleStripeCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      const order = await this.getOrderBySessionId(session.id);
      if (!order) return;

      await this.updateOrderStatus(order.id, OrderStatus.PAYMENT_SUCCEEDED);

      // Handle different order types
      switch (order.type) {
        case OrderType.INITIAL_SUBSCRIPTION:
          // Check if this is our initial subscription order (not formation)
          if (session.metadata?.orderType === 'initialSubscription') {
            await this.handleInitialSubscriptionOrder(order);
          }
          break;
        default:
          // extend for other order types if needed
          break;
      }
    } catch (e) {
      console.error('Error handling checkout session completed:', e);
    }
  }

  /**
   * INITIAL SUBSCRIPTION FULFILLMENT (after payment success)
   * - Creates user
   * - (Mailbox creation to be integrated)
   * - Prepares subscription items from order items if needed
   */
  async handleInitialSubscriptionOrder(order: OrderResponseDto) {
    try {
      const md = (order.metadata || {}) as any;
      const firstName = md.firstName;
      const lastName = md.lastName;
      const officeLocationId = md.officeLocationId;
      const planPriceId = md.planPriceId;

      if (!firstName || !officeLocationId || !planPriceId) {
        throw new BadRequestException('Missing required metadata for initial subscription');
      }

      // 1) Create user (or get existing by email if you prefer)
      const newUser = await this.userService.createUser(
        order.email,
        firstName,
        lastName,
        order.stripeCustomerId,
      );
      const workspace = newUser.workspaces[0];

      // 2) TODO: Create mailbox for the workspace (depends on your domain flow)

      // 3) Identify plan & addons in items
      const planItem = order.items.find((i) => i.itemType === 'PLAN');
      const addons = order.items.filter((i) => i.itemType === 'ADDON');

      if (!planItem) throw new BadRequestException('No plan item found in order');

      // 4) Map to subscription items (domain-specific; mailbox integration later)
      // For now, just log
      console.log('Subscription creation pending mailbox integration', {
        workspaceId: workspace?.workspaceId,
        planItemId: planItem.itemId,
        addonCount: addons.length,
        officeLocationId,
      });

      return {
        message: 'Initial order processed successfully',
        workspaceId: workspace?.workspaceId,
      };
    } catch (err: any) {
      console.error('Error handling initial subscription order:', err);
      throw new HttpException(
        err.message || 'Failed to process initial subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * (Optional) Existing subscription order (add items)
   * Kept as-is but you’ll likely shift to priceId arrays similar to initial flow.
   */
  async createOrder(dto: CreateOrderDto, userId: string, context: ContextDto): Promise<OrderResponseDto> {
    try {
      let totalAmount = 0;
      const orderItems = [];
      for (const item of dto.items) {
        const itemData = await this.calculateLegacyOrderItem(item);
        totalAmount += itemData.totalPrice;
        orderItems.push(itemData);
      }

      const user = await this.userService.findUserById(userId);
      const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
      const customerId = await this.stripeService.findOrCreateStripeCustomer(user.email, fullName);

      const paymentIntent = await this.stripeService.createPaymentIntentForOrder({
        amount: totalAmount,
        currency: 'USD',
        customer: customerId,
        metadata: {
          orderType: 'subscription',
          customerEmail: user.email,
          workspaceId: context.workspaceId,
          mailboxId: context.mailboxId,
          itemCount: dto.items.length.toString(),
          cart: JSON.stringify(dto.items),
        },
      });

      const order = await this.prisma.order.create({
        data: {
          email: user.email,
          totalAmount,
          currency: 'USD',
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
          stripeCustomerId: customerId,
          type: OrderType.SUBSCRIPTION,
          metadata: {
            workspaceId: context.workspaceId,
            mailboxId: context.mailboxId,
            subscriptionId: dto.subscriptionId,
          },
          items: { create: orderItems },
        },
        include: { items: true },
      });

      return this.mapOrderToResponseDto(order);
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to create order',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== Helpers (new model) =====

  private mapPlanToOrderItem(planPrice: any) {
    return {
      itemType: 'PLAN' as const,
      itemId: planPrice.id, // planPriceId
      quantity: 1,
      unitPrice: planPrice.amount,
      totalPrice: planPrice.amount,
      currency: planPrice.currency,
      itemName: planPrice.plan?.name,
      itemDescription: planPrice.description || planPrice.plan?.description,
    };
  }

  private async buildAddonItems(addonPriceIds: string[]) {
    if (!addonPriceIds.length) {
      return { addonItems: [], addonsTotal: 0 };
    }

    const prices = await this.prisma.price.findMany({
      where: { id: { in: addonPriceIds } },
      include: { product: true, recurring: true },
    });

    if (prices.length !== addonPriceIds.length) {
      const found = new Set(prices.map((p) => p.id));
      const missing = addonPriceIds.filter((id) => !found.has(id));
      throw new NotFoundException(`Missing addon prices: ${missing.join(', ')}`);
    }

    const addonItems = prices.map((p) => ({
      itemType: 'ADDON' as const,
      itemId: p.id,
      quantity: 1,
      unitPrice: p.unit_amount,
      totalPrice: p.unit_amount,
      currency: p.currency,
      itemName: `${p.product?.name ?? 'Addon'}${p.name ? ' - ' + p.name : ''}`,
      itemDescription: p.description,
    }));

    const addonsTotal = addonItems.reduce((sum, i) => sum + i.totalPrice, 0);

    return { addonItems, addonsTotal };
  }

  // ===== Helpers (legacy path retained for createOrder) =====

  private async calculateLegacyOrderItem(item: CreateOrderItemDto) {
    const quantity = item.quantity || 1;

    switch (item.itemType) {
      case OrderItemType.PLAN: {
        const planPrice = await this.prisma.planPrice.findUnique({
          where: { id: item.itemId },
          include: { plan: true },
        });
        if (!planPrice) throw new NotFoundException(`Plan price ${item.itemId} not found`);

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
      }

      case OrderItemType.ADDON:
      case OrderItemType.PRODUCT: {
        const variant = await this.prisma.price.findUnique({
          where: { id: item.itemId },
          include: { product: true, recurring: true },
        });
        if (!variant) throw new NotFoundException(`Price ${item.itemId} not found`);

        return {
          itemType: item.itemType,
          itemId: item.itemId,
          quantity,
          unitPrice: variant.unit_amount,
          totalPrice: variant.unit_amount * quantity,
          currency: variant.currency,
          itemName: `${variant.product?.name ?? 'Item'}${variant.name ? ' - ' + variant.name : ''}`,
          itemDescription: variant.description,
        };
      }

      default:
        throw new BadRequestException(`Unsupported item type: ${item.itemType}`);
    }
  }

  // ===== Common mapper =====

  private mapOrderToResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      email: order.email,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeCustomerId: order.stripeCustomerId,
      stripeSessionId: order.stripeSessionId,
      stripeClientSecret: order.stripeClientSecret,
      stripeCheckoutUrl: order.metadata?.stripeCheckoutUrl,
      userId: order.userId,
      metadata: order.metadata,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      completedAt: order.completedAt,
      type: order.type,
      items: order.items.map((it: any) => ({
        id: it.id,
        itemType: it.itemType,
        itemId: it.itemId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        currency: it.currency,
        itemName: it.itemName,
        itemDescription: it.itemDescription,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
      })),
    };
  }
}
