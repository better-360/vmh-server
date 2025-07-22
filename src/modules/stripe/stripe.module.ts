import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { BillingService } from '../billing/billing.service';

@Module({
    imports: [HttpModule,ConfigModule],
    providers: [ StripeService,BillingService],
    controllers: [WebhookController,StripeController],
})
export class StripeModule {}
