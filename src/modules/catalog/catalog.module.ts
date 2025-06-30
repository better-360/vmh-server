import { CatalogController } from './catalog.controller';
import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { FeaturesService } from './features.service';
import { PlansService } from './plans.service';

@Module({
  controllers: [
    CatalogController,],
  providers: [CatalogService,FeaturesService,PlansService],
  exports: [CatalogService],
})
export class CatalogModule {}   