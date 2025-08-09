import { Global, Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { FeaturesService } from './features.service';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PrismaService } from 'src/prisma.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { FeatureUsageService } from './usage.service';
import { StripeService } from '../stripe/stripe.service';

@Global() 
@Module({
  controllers: [PlansController, LocationController],
  providers: [CatalogService, FeaturesService, PlansService, PrismaService, LocationService, FeatureUsageService, StripeService],
  exports: [CatalogService, FeaturesService, PlansService, LocationService, FeatureUsageService],
})
export class CatalogModule {}   