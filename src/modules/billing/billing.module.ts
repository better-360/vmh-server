import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BillingService } from './billing.service';
import { StripeService } from '../stripe/stripe.service';
import { BillingController } from './billing.controller';

@Module({
    imports: [HttpModule],
    providers: [BillingService,StripeService],
    controllers: [BillingController],
})
export class BillingModule {}