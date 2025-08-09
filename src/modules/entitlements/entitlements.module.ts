import { Module } from '@nestjs/common';
import { EntitlementResolverService } from './entitlement_resolver.service';
import { PlanFeaturesService } from './plan_features.service';
import { PlanAddonsService } from './plan_addons.service';

@Module({
  controllers: [],
  providers: [EntitlementResolverService, PlanFeaturesService, PlanAddonsService],
})
export class EntitlementsModule {}      