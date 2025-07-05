import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { FeaturesService } from './features.service';
import { PlansService } from './plans.service';
import { FeaturesController } from './features.controller';
import { PlansController } from './plans.controller';
import { PrismaService } from 'src/prisma.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { TemplatesController } from './template.controller';

@Module({
  controllers: [FeaturesController, PlansController, LocationController,TemplatesController],
  providers: [CatalogService, FeaturesService, PlansService, PrismaService, LocationService],
  exports: [CatalogService, FeaturesService, PlansService, LocationService],
})
export class CatalogModule {}   