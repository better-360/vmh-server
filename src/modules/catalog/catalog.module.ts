import { Global, Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { FeaturesService } from './features.service';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PrismaService } from 'src/prisma.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
// import { TemplatesController } from '../admin/template.controller'; // Disabled
import { MarketService } from './market.service';
import { FeatureUsageService } from './usage.service';

@Global() 
@Module({
  controllers: [PlansController, LocationController], // TemplatesController disabled
  providers: [CatalogService, FeaturesService, PlansService, PrismaService, LocationService, MarketService, FeatureUsageService],
  exports: [CatalogService, FeaturesService, PlansService, LocationService, MarketService, FeatureUsageService],
})
export class CatalogModule {}   