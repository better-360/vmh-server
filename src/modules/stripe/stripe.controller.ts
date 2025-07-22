import { StripeService } from './stripe.service';
import { Public } from 'src/common/decorators/public.decorator';
import {
  Controller,
  Post,
  Headers,
  Get,
  Body,
  Param,
  RawBodyRequest,
  Req,
  Res,
  Delete,
  InternalServerErrorException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Stripe Operations')
@Controller('stripe')
export class StripeController {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly stripeService: StripeService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
    );
  }

@Public()
@Get('stripe-success')
async handleStripeSuccess(@Query('session_id') sessionId: string) {
  if (!sessionId) {
    throw new BadRequestException('Session ID is missing');
  }
  // Stripe Checkout Session'ı çekiyoruz
  const session = await this.stripeService.retrieveCheckoutSession(sessionId);
  console.log(session.metadata.companyId);
  const invoice=await this.stripeService.getInvoice(session.invoice as string);
  const payment_intent=await this.stripeService.getPaymentIntent(invoice.payment_intent as string);
 console.log(payment_intent.payment_method)
  console.log('Stripe Checkout Session:', session);
  console.log('Stripe Invoice:', invoice);
  console.log('Stripe Payment Intent:', payment_intent);
  // Gerekli kontrolleri yapıp, loglayabilir veya kullanıcıyı uygun sayfaya yönlendirebilirsiniz.
  return session; // veya yönlendirme yapabilirsiniz
}


  /**
   * Stripe Webhook: checkout.session.completed event'ini dinler.
   * Bu event, şirket kurulum senaryosu için oluşturulan Checkout Session tamamlandığında tetiklenir.
   *
   * Beklenen senaryo:
   * - Checkout Session, subscription modunda oluşturulmuş olmalı.
   * - Metadata içinde formation: "true" ve subscriptionPriceId alanı bulunmalı.
   * - Kullanıcı ödeme sayfasında kart bilgilerini girdikten sonra, Stripe PaymentIntent oluşturur.
   * - Bu webhook PaymentIntent'den PaymentMethod id'sini alır ve 30 günlük trial ile abonelik oluşturur.
   */
  @Public()
  @Get('/checkout-session-completed')
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
console.log('Webhook received:', req.body);
console.log('Webhook signature:', sig);
console.log('Webhook Request:', req);
    // Webhook imzasını doğrula
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Yalnızca checkout.session.completed event'lerini işleyelim.
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Sadece formation sürecine ait session'ları işlemek için metadata kontrolü
      if (session.metadata && session.metadata.formation === 'true') {
        try {
          // Checkout session tamamlandığında PaymentIntent id'si session.payment_intent alanında bulunur.
          if (session.payment_intent) {
            // PaymentIntent'i Stripe üzerinden alın
            const paymentIntent = await this.stripe.paymentIntents.retrieve(session.payment_intent as string);
            const paymentMethodId = paymentIntent.payment_method;
            const customerId = session.customer as string;

            // Abonelik oluşturulması için gerekli alan: subscriptionPriceId
            const subscriptionPriceId = session.metadata.subscriptionPriceId;
            if (!subscriptionPriceId) {
              throw new InternalServerErrorException('Missing subscription price id in session metadata');
            }

            // Abonelik oluştur: 30 günlük trial ekleyerek
            const subscription = await this.stripeService.createSubscription({
              customer: customerId,
              items: [{ price: subscriptionPriceId }],
              default_payment_method: paymentMethodId as string,
              trial_period_days: 30,
            });

            console.log('Formation subscription created:', subscription.id);
          }
        } catch (error) {
          console.error('Error processing formation subscription webhook:', error);
        }
      }
    }
    // Stripe'a event alındığına dair yanıt gönder
    res.json({ received: true });
  }

  @Public()
  @Post('search')
  async searchQuery(@Body() body: { query: string }) {
    return this.stripeService.searchProducts(body.query);
  }

  @Public()
  @Post('checkout')
  async createCheckoutSession(@Body() body: any) {
    return this.stripeService.createCheckoutSession(body);
  }

  @Public()
  @Get('products')
  async getProducts() {
    return await this.stripeService.getProducts();
  }

  @Public()
  @Get('/:productId/details')
  async getProductDetails(@Param('productId') productId: string) {
    return this.stripeService.getProductDetails(productId);
  }

  @Public()
  @Get('/:productId/prices')
  async getProductPrices(@Param('productId') productId: string) {
    return this.stripeService.searchPricesByProduct(productId);
  }

  @Public()
  @Post('create-customer')
  async createCustomer(@Body() body: any) {
    return this.stripeService.createCustomer(body);
  }

  @Public()
  @Get('customer/:id')
  async getCustomer(@Param('id') id: string) {
    return this.stripeService.retrieveCustomer(id);
  }

  @Public()
  @Delete('product/:id')
  async deleteProduct(@Param('id') id: string) {
    return await this.stripeService.deleteProduct(id);
  }

  @Public()
  @Get('invoices/all')
  async getAllInvoices() {
    return await this.stripeService.getAllInvoices();
  }

  @Public()
  @Get('invoices/:id')
  async getInvoiceById(@Param('id') id: string) {
    return await this.stripeService.getInvoice(id);
  }

  @Public()
  @Post('product/:id/create-price')
  async createPrice(@Param('id') id: string,@Body() data: any) {
    return await this.stripeService.createPriceForProduct(id,data);
  }

}
