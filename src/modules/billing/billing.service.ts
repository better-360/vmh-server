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
import { PurchareSingleItemDataDto } from 'src/dtos/check-out.dto';
import { Events } from 'src/common/enums/event.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface User {
  id: string;
  customerStripeID: string;
  email: string;
}

@Injectable()
export class BillingService {
  private stripe: Stripe;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
    );
  }

  async handleCheckOutSessionCompleted(sessionId: string) {
    // 1. Stripe'dan Checkout Session verilerini al
    const session = await this.stripeService.retrieveCheckoutSession(sessionId);
    if (session.metadata.paymentType === 'singleItemPurchase') {
      console.log('Single item purchase detected');
     // return this.handleSingleItemPurchaseCheckoutCompleted(session);
    }
  }



}
