import { SubscriptionController } from './subscription.controller';
import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { FeaturesService } from '../catalog/features.service';
import { CatalogService } from '../catalog/catalog.service';
import { PlansService } from '../catalog/plans.service';

@Module({
  providers: [SubscriptionService,CatalogService,FeaturesService,PlansService,],
  exports: [SubscriptionService],
  controllers: [
    SubscriptionController,],
})
export class SubscriptionModule { }