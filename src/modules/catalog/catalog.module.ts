import { PlansController } from './plans.controller';
import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { FeaturesService } from './features.service';
import { PlansService } from './plans.service';
import { FeaturesController } from './features.controller';

@Module({
  controllers: [
    PlansController,FeaturesController],
  providers: [CatalogService,FeaturesService,PlansService],
  exports: [CatalogService],
})
export class CatalogModule {}   