import { SubscriptionController } from './subscription.controller';
import { Global, Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { FeaturesService } from '../catalog/features.service';
import { CatalogService } from '../catalog/catalog.service';
import { PlansService } from '../catalog/plans.service';
import { StripeService } from '../stripe/stripe.service';

@Global() 
@Module({
  providers: [SubscriptionService,CatalogService,FeaturesService,PlansService,StripeService],
  exports: [SubscriptionService],
  controllers: [
    SubscriptionController,],
})
export class SubscriptionModule { }