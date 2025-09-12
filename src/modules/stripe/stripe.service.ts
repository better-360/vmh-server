import Stripe from 'stripe';
import {
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SubscriptionItemDto {
  productId: string;
  stripePriceId: string;
  // Recurring bilgisi: eğer ürün abonelik ise bu alan dolu olacaktır.
  recurring: {
    interval: string; // Örneğin, "month" veya "year"
    interval_count: number; // Örneğin, 1
  } | null;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
    );
  }

  async searchProducts(
    query: Stripe.ProductSearchParams['query'],
  ): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.search({ query });
      this.logger.log('Products fetched successfully');
      return products.data;
    } catch (error) {
      this.logger.error('Failed to fetch products from Stripe', error.stack);
      throw new Error('Unable to fetch products from Stripe');
    }
  }

  // Product CRUD operations
  async getProducts(): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.list();
      this.logger.log('Products fetched successfully');
      return products.data;
    } catch (error) {
      this.logger.error('Failed to fetch products from Stripe', error.stack);
      throw new Error('Unable to fetch products from Stripe');
    }
  }

  async getProductDetails(productId: string): Promise<any> {
    try {
      const products = await this.stripe.prices.list({ product: productId });
      this.logger.log('Products fetched successfully');
      return products.data;
    } catch (error) {
      this.logger.error('Failed to fetch products from Stripe', error.stack);
      throw new Error('Unable to fetch products from Stripe');
    }
  }

  async createProduct(
    data: Stripe.ProductCreateParams,
  ): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create(data);
      this.logger.log('Product created successfully');
      return product;
    } catch (error) {
      this.logger.error('Failed to create product on Stripe', error.stack);
      throw new Error('Unable to create product on Stripe');
    }
  }

  async updateProduct(
    productId: string,
    data: Stripe.ProductUpdateParams,
  ): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.update(productId, data);
      this.logger.log('Product updated successfully');
      return product;
    } catch (error) {
      this.logger.error('Failed to update product on Stripe', error);
      throw new Error('Unable to update product on Stripe');
    }
  }

  async deleteProduct(productId: string): Promise<Stripe.DeletedProduct> {
    try {
      const product = await this.stripe.products.del(productId);
      this.logger.log('Product deleted successfully');
      return product;
    } catch (error) {
      this.logger.error('Failed to delete product on Stripe', error.stack);
      throw new HttpException(
        `Unable to delete product on Stripe ${error.message}`,
        500,
      );
    }
  }

  async deactiveProduct(productId: string): Promise<Stripe.Product> {
    try {
      // Önce ürünü silmeyi dene - bu başarılı olursa otomatik olarak fiyatları da siler
      try {
        await this.stripe.products.del(productId);
        this.logger.log('Product deleted successfully from Stripe');

        // Ürün silindiyse, boş bir product objesi döner (Stripe API behavior)
        return { id: productId, deleted: true } as any;
      } catch (deleteError) {
        this.logger.warn(
          'Could not delete product, attempting to delete prices individually:',
          deleteError.message,
        );

        // Ürün silinemezse, fiyatları tek tek işle
        const prices = await this.stripe.prices.list({
          product: productId,
          limit: 100, // Tüm fiyatları al
        });

        const deletionResults = {
          deletedPrices: [],
          deactivatedPrices: [],
          errors: [],
        };

        // Önce non-default fiyatları sil/deaktive et
        for (const price of prices.data) {
          try {
            // Önce silmeyi dene
            await this.stripe.prices.update(price.id, { active: false });
            deletionResults.deactivatedPrices.push(price.id);
            this.logger.log(`Price ${price.id} deactivated successfully`);
          } catch (priceError) {
            this.logger.warn(
              `Could not process price ${price.id}:`,
              priceError.message,
            );
            deletionResults.errors.push({
              priceId: price.id,
              error: priceError.message,
            });
          }
        }

        // Şimdi ürünü silmeyi tekrar dene
        try {
          await this.stripe.products.del(productId);
          this.logger.log(
            'Product deleted successfully after processing prices',
          );
          return { id: productId, deleted: true } as any;
        } catch (secondDeleteError) {
          this.logger.warn(
            'Product still cannot be deleted, deactivating instead:',
            secondDeleteError.message,
          );

          // Son çare: ürünü deaktive et
          const product = await this.stripe.products.update(productId, {
            active: false,
          });

          this.logger.log('Product deactivated successfully', {
            productId,
            deletionResults,
          });

          return product;
        }
      }
    } catch (error) {
      this.logger.error('Failed to process product removal on Stripe', {
        productId,
        error: error.message,
        stack: error.stack,
      });

      throw new HttpException(
        `Unable to remove product from Stripe: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Price CRUD operations
  async getPrices(): Promise<Stripe.Price[]> {
    try {
      const prices = await this.stripe.prices.list();
      this.logger.log('Prices fetched successfully');
      return prices.data;
    } catch (error) {
      this.logger.error('Failed to fetch prices from Stripe', error.message);
      throw new HttpException(
        `Unable to fetch prices from Stripe ${error.message}`,
        500,
      );
    }
  }

  async getPrice(priceId: string): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.retrieve(priceId);
      this.logger.log('Price fetched successfully');
      return price;
    } catch (error) {
      this.logger.error('Failed to fetch price from Stripe', error.message);
      throw new HttpException(
        `Unable to fetch price from Stripe ${error.message}`,
        500,
      );
    }
  }

  async getProduct(productId: string): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.retrieve(productId);
      this.logger.log('Products fetched successfully');
      return product;
    } catch (error) {
      this.logger.error('Failed to fetch products from Stripe', error.stack);
      throw new HttpException(
        `Unable to fetch products from Stripe ${error.message}`,
        500,
      );
    }
  }

  async createPriceForProduct(
    productId: string,
    data: Stripe.PriceCreateParams,
  ): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create({
        unit_amount: data.unit_amount,
        currency: data.currency,
        recurring: data.recurring,
        product: productId,
      });
      this.logger.log('Price created successfully');
      return price;
    } catch (error) {
      this.logger.error('Failed to create price on Stripe', error.stack);
      throw new HttpException(
        `Unable to create price on Stripe ${error.message}`,
        500,
      );
    }
  }

  async createPrice(data: Stripe.PriceCreateParams): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create(data);
      this.logger.log('Price created successfully');
      return price;
    } catch (error) {
      this.logger.error('Failed to create price on Stripe', error.stack);
      throw new HttpException(
        `Unable to create price on Stripe ${error.message}`,
        500,
      );
    }
  }

  async updatePrice(
    priceId: string,
    data: Stripe.PriceUpdateParams,
  ): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.update(priceId, data);
      this.logger.log('Price updated successfully');
      return price;
    } catch (error) {
      this.logger.error('Failed to update price on Stripe', error.stack);
      throw new HttpException(
        `Unable to update price on Stripe ${error.message}`,
        500,
      );
    }
  }

  async deactivePrice(priceId: string) {
    try {
      const price = await this.stripe.prices.retrieve(priceId);
      if (!price) {
        throw new Error('Price not found');
      }

      const productId = price.product as string;

      // Product bilgisini al
      const product = await this.stripe.products.retrieve(productId);

      // Eğer bu price default price ise özel işlem gerekiyor
      if (product.default_price === priceId) {
        this.logger.warn(
          `Attempting to delete default price ${priceId} for product ${productId}`,
        );

        // Ürünün diğer aktif price'larını kontrol et
        const allPrices = await this.stripe.prices.list({
          product: productId,
          active: true,
        });

        // Bu price dışındaki aktif price'ları bul
        const otherActivePrices = allPrices.data.filter(
          (p) => p.id !== priceId,
        );

        if (otherActivePrices.length > 0) {
          // Başka aktif price varsa, ilkini default yap
          const newDefaultPrice = otherActivePrices[0];

          this.logger.log(
            `Setting new default price ${newDefaultPrice.id} for product ${productId}`,
          );
          await this.stripe.products.update(productId, {
            default_price: newDefaultPrice.id,
          });

          // Şimdi eski default price'ı güvenle deaktive edebiliriz
          await this.stripe.prices.update(priceId, {
            active: false,
          });

          this.logger.log(
            `Successfully deactivated former default price ${priceId}`,
          );
          return HttpStatus.OK;
        } else {
          // Başka aktif price yok, minimal bir dummy price oluştur
          this.logger.log(
            `Creating dummy price for product ${productId} before deleting default price`,
          );

          // Minimal dummy price oluştur (aynı currency ile)
          const dummyPrice = await this.stripe.prices.create({
            unit_amount: 100, // $1.00 minimum
            currency: price.currency,
            product: productId,
          });

          // Dummy price'ı default yap
          await this.stripe.products.update(productId, {
            default_price: dummyPrice.id,
          });

          // Şimdi orijinal price'ı deaktive et
          await this.stripe.prices.update(priceId, {
            active: false,
          });

          // Dummy price'ı da hemen deaktive et (sadece default olmak için oluşturuldu)
          await this.stripe.prices.update(dummyPrice.id, {
            active: false,
          });

          this.logger.log(
            `Successfully created dummy price and deactivated default price ${priceId}`,
          );
          return HttpStatus.OK;
        }
      } else {
        // Default price değilse normal şekilde deaktive et
        await this.stripe.prices.update(priceId, {
          active: false,
        });

        this.logger.log(
          `Successfully deactivated non-default price ${priceId}`,
        );
        return HttpStatus.OK;
      }
    } catch (error) {
      this.logger.error('Failed to delete price on Stripe', error.stack);

      // Eğer hata mesajı default price ile ilgiliyse daha açıklayıcı hata ver
      if (error.message && error.message.includes('default price')) {
        throw new HttpException(
          `This price is the default price of the product and cannot be deleted. Please set another price as default or delete the product.`,
          400,
        );
      }

      throw new HttpException(
        `Unable to delete price on Stripe ${error.message}`,
        500,
      );
    }
  }

  async setDefaultPrice(
    priceId: string,
    productId: string,
  ): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.update(productId, {
        default_price: priceId,
      });
      this.logger.log('Default price set successfully');
      return product;
    } catch (error) {
      this.logger.error('Failed to set default price on Stripe', error.stack);
      throw new HttpException(
        `Unable to set default price on Stripe ${error.message}`,
        500,
      );
    }
  }

  async searchPricesByProduct(productId: string): Promise<Stripe.Price[]> {
    try {
      const prices = await this.stripe.prices.list({ product: productId });
      this.logger.log('Prices fetched successfully');
      return prices.data;
    } catch (error) {
      this.logger.error('Failed to fetch prices from Stripe', error.stack);
      throw new HttpException(
        `Unable to fetch prices from Stripe ${error.message}`,
        500,
      );
    }
  }

  async createCustomer(
    data: Stripe.CustomerCreateParams,
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create(data);
      this.logger.log('Customer created successfully');
      return customer as Stripe.Customer;
    } catch (error) {
      this.logger.error('Failed to create customer on Stripe', error.stack);
      throw new HttpException(
        `Unable to create customer on Stripe ${error.message}`,
        500,
      );
    }
  }

  async retrieveCustomer(id: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(id);
      this.logger.log('Customer retrieved successfully');
      return customer as Stripe.Customer;
    } catch (error) {
      this.logger.error('Failed to retrieve customer on Stripe', error.stack);
      throw new HttpException(
        `Unable to retrieve customer on Stripe ${error.message}`,
        500,
      );
    }
  }

  async searchCustomer(email: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.search({
        query: `email:'${email}'`,
      });
      if (customer.data.length === 0) {
        throw new NotFoundException('Customer not found');
      }
      this.logger.log('Customer retrieved successfully');
      return customer.data[0] as Stripe.Customer;
    } catch (error) {
      this.logger.error('Failed to retrieve customer on Stripe', error.stack);
      throw new HttpException(
        `Unable to retrieve customer on Stripe ${error.message}`,
        500,
      );
    }
  }
  async createSubscription(
    data: Stripe.SubscriptionCreateParams,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create(data);
      this.logger.log('Subscription created successfully');
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create subscription on Stripe', error.stack);
      throw new HttpException(
        `Unable to create subscription on Stripe ${error.message}`,
        500,
      );
    }
  }

  async createCheckoutSession(
    data: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create(data);
      this.logger.log('Checkout session created successfully');
      return session;
    } catch (error) {
      this.logger.error(
        'Failed to create checkout session on Stripe',
        error.stack,
      );
      throw new HttpException(
        `Unable to create checkout session on Stripe ${error.message}`,
        500,
      );
    }
  }

  async createInvoiceItem(
    params: Stripe.InvoiceItemCreateParams,
  ): Promise<Stripe.InvoiceItem> {
    try {
      return this.stripe.invoiceItems.create(params);
    } catch (error) {
      this.logger.error('Failed to create invoice item on Stripe', error.stack);
      throw new HttpException(
        `Failed to create invoice item on Stripe' ${error.message}`,
        500,
      );
    }
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId);
      this.logger.log('Invoice fetched successfully');
      return invoice;
    } catch (error) {
      this.logger.error('Failed to fetch invoice from Stripe', error.stack);
      throw new HttpException(
        `Unable to fetch invoice from Stripe ${error.message}`,
        500,
      );
    }
  }

  async getPaymentIntent(
    payment_intent: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(payment_intent);
      this.logger.log('PaymentIntent fetched successfully');
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        'Failed to fetch paymentIntent from Stripe',
        error.stack,
      );
      throw new HttpException(
        `Unable to fetch paymentIntent from Stripe ${error.message}`,
        500,
      );
    }
  }

  async getInvoicesByCustomer(
    customerId: string,
  ): Promise<Stripe.ApiList<Stripe.Invoice>> {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
      });
      this.logger.log('Invoices fetched successfully');
      return invoices;
    } catch (error) {
      this.logger.error('Failed to fetch invoices from Stripe', error.stack);
      throw new HttpException(
        `Unable to fetch invoices from Stripe ${error.message}`,
        500,
      );
    }
  }

  async getAllInvoices(): Promise<Stripe.ApiList<Stripe.Invoice>> {
    try {
      const invoices = await this.stripe.invoices.list();
      this.logger.log('Invoices fetched successfully');
      return invoices;
    } catch (error) {
      this.logger.error('Failed to fetch invoices from Stripe', error.stack);
      throw new HttpException(
        `Unable to fetch invoices from Stripe ${error.message}`,
        500,
      );
    }
  }

  async createGroupedSubscriptions(
    customerId: string,
    subscriptionItems: SubscriptionItemDto[],
    defaultPaymentMethod: string,
  ): Promise<Stripe.Subscription[]> {
    // Aynı recurring değerlerine sahip ürünleri gruplayacağız.
    // Gruplama anahtarı: "interval-interval_count"
    const groups = new Map<
      string,
      {
        recurring: { interval: string; interval_count: number };
        items: { stripePriceId: string; quantity: number }[];
      }
    >();

    for (const item of subscriptionItems) {
      // Sadece abonelik ürünleri için işlem yapıyoruz.
      if (!item.recurring) continue;

      const groupKey = `${item.recurring.interval}-${item.recurring.interval_count}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, { recurring: item.recurring, items: [] });
      }
      groups
        .get(groupKey)
        ?.items.push({ stripePriceId: item.stripePriceId, quantity: 1 });
    }

    const subscriptions: Stripe.Subscription[] = [];
    // Her grup için ayrı bir abonelik oluşturuyoruz.
    for (const [groupKey, groupData] of groups.entries()) {
      try {
        const subscription = await this.stripe.subscriptions.create({
          customer: customerId,
          items: groupData.items.map((item) => ({
            price: item.stripePriceId,
            quantity: item.quantity,
          })),
          default_payment_method: defaultPaymentMethod,
          trial_period_days: 0, // İhtiyaca göre trial süresi ekleyebilirsiniz
        });
        subscriptions.push(subscription);
      } catch (error) {
        throw new InternalServerErrorException(
          `Error creating subscription for group ${groupKey}: ${error.message}`,
        );
      }
    }

    return subscriptions;
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      this.logger.log('Subscription fetched successfully');
      return subscription;
    } catch (error) {
      this.logger.error(
        'Failed to fetch subscription from Stripe',
        error.stack,
      );
      throw new HttpException(
        `Unable to fetch subscription from Stripe ${error.message}`,
        500,
      );
    }
  }

  async createPaymentIntent(
    data: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create(data);
      this.logger.log('Payment intent created successfully');
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        'Failed to create payment intent on Stripe',
        error.stack,
      );
      throw new HttpException(
        `Unable to create payment intent on Stripe ${error.message}`,
        500,
      );
    }
  }

  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      this.logger.log('Checkout session retrieved successfully');
      return session;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve checkout session from Stripe',
        error.stack,
      );
      throw new HttpException(
        `Unable to retrieve checkout session from Stripe ${error.message}`,
        500,
      );
    }
  }

  async createPaymentIntentForOrder(
    params: Stripe.PaymentIntentCreateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentIntent> {
    const { amount, currency, customer, metadata } = params;
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer,
        metadata,
        automatic_payment_methods: { enabled: true },
        setup_future_usage: 'off_session',
      });
      this.logger.log('Payment intent created successfully for order');
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        'Failed to create payment intent on Stripe',
        error.stack,
      );
      throw new HttpException(
        `Unable to create payment intent on Stripe ${error.message}`,
        500,
      );
    }
  }

  async createCheckoutSessionForOrder(params: {
    amount: number;
    currency: string;
    customer: string;
    metadata: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: params.customer,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency,
              product_data: {
                name: 'Initial Subscription Order',
                description: 'Plan and addons for initial subscription',
              },
              unit_amount: params.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
        automatic_tax: { enabled: false },
        payment_intent_data: {
          setup_future_usage: 'off_session',
        },
      });
      this.logger.log('Checkout session created successfully for order');
      return session;
    } catch (error) {
      this.logger.error(
        'Failed to create checkout session on Stripe',
        error.stack,
      );
      throw new HttpException(
        `Unable to create checkout session on Stripe ${error.message}`,
        500,
      );
    }
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      this.logger.log('Payment intent retrieved successfully');
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve payment intent from Stripe',
        error.stack,
      );
      throw new HttpException(
        `Unable to retrieve payment intent from Stripe ${error.message}`,
        500,
      );
    }
  }
  async findOrCreateStripeCustomer(
    email: string,
    name: string,
  ): Promise<string> {
    let customerId: string;
    let customer = await this.stripe.customers.search({
      query: `email:'${email}'`,
    });
    if (customer.data.length > 0) {
      customerId = customer.data[0].id;
    } else {
      const created = await this.stripe.customers.create({ email, name });
      customerId = created.id;
    }
    return customerId;
  }

  async stripeWebhookHandler(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          this.logger.log(`Payment succeeded for invoice ${invoice.id}`);
          // İşlem sonrası yapılacaklar (örn. veritabanı güncelleme)
          break;
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          this.logger.error(`Payment failed for invoice ${failedInvoice.id}`);
          // İşlem sonrası yapılacaklar (örn. kullanıcı bilgilendirme)
          break;
        case 'customer.subscription.created':
          const subscription = event.data.object as Stripe.Subscription;
          this.logger.log(`Subscription created: ${subscription.id}`);
          // İşlem sonrası yapılacaklar (örn. veritabanı güncelleme)
          break;
        case 'customer.subscription.updated':
          const updatedSubscription = event.data.object as Stripe.Subscription;
          this.logger.log(`Subscription updated: ${updatedSubscription.id}`);
          // İşlem sonrası yapılacaklar (örn. veritabanı güncelleme)
          break;
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          this.logger.log(`Subscription deleted: ${deletedSubscription.id}`);
          // İşlem sonrası yapılacaklar (örn. veritabanı güncelleme)
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
          break;
      }
    } catch (error) {
      this.logger.error('Error handling Stripe webhook event', error.stack);
      throw new InternalServerErrorException(
        `Error handling Stripe webhook event: ${error.message}`,
      );
    }
  }

}
