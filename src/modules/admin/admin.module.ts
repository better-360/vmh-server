import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HttpModule } from '@nestjs/axios';
import { AdminSupportController } from './support.controller';
import { AdminMainController } from './admin.controller';
import { SupportService } from '../support/support.service';
import { StripeService } from '../stripe/stripe.service';
import { MailService } from '../mail/mail.service';
import { PlansService } from '../catalog/plans.service';
import { FeaturesService } from '../catalog/features.service';
import { AdminLocationController } from './location.controller';
import { AdminPlansController } from './plans.controller';
import { AdminFeaturesController } from './features.controller';
import { PlanAddonsService } from '../entitlements/plan_addons.service';
import { PlanAddonsController } from './plan_addons.controller';
import { PlanFeaturesController } from './plan_features.controller';
import { PlanFeaturesService } from '../entitlements/plan_features.service';


@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    AdminService,
    UserService,
    SupportService,
    StripeService,
    MailService,
    PlansService,
    FeaturesService,
    PlanAddonsService,
    PlanFeaturesService,
  ],

  exports: [AdminService],
  controllers: [
    AdminMainController,
    AdminSupportController,
    AdminLocationController,
    AdminFeaturesController,
    AdminPlansController,
    PlanAddonsController,
    PlanFeaturesController,
  ],
})
export class AdminModule {}
