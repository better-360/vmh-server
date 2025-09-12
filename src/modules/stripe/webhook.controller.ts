// webhook.controller.ts
import { Controller, Post, Req, Res, Headers, HttpStatus, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { BillingService } from '../billing/billing.service'; // Disabled

@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(private configService: ConfigService,private billingService:BillingService) { 
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
    });
  }

  @Post()
  async handleStripeWebhook(
    @Req() req: any,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET_KEY');
    let event: Stripe.Event;

    try {
      // NestJS rawBody opsiyonu ile raw body'ye erişim
      const rawBody = req.rawBody;
      event = this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }

    // 🎯 Ödeme durumu işleme
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Ödeme başarılı:', intent.id);
        this.billingService.handleStripePaymentIntentSucceeded(intent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const errorMessage = intent.last_payment_error?.message;
        console.log('❌ Ödeme başarısız:', intent.id, errorMessage);
        this.billingService.handleStripePaymentIntentPaymentFailed(intent);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session tamamlandı:', session.id);
        this.billingService.handleStripeCheckoutSessionCompleted(session);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  }

}
