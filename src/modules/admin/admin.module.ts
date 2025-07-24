import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HttpModule } from '@nestjs/axios';
import { AdminSupportController } from './support.controller';
import { AdminMainController } from './admin.controller';
import { SupportService } from '../support/support.service';
import { StripeService } from '../stripe/stripe.service';
import { AdminPackageController } from './package.controller';
import { PackageService } from '../package/package.service';
import { AddonsService } from '../catalog/addons.service';
import { AdminAddonsController } from './addons.controller';
import { PlansService } from '../catalog/plans.service';
import { FeaturesService } from '../catalog/features.service';
import { AdminLocationController } from './location.controller';
import { AdminPlansController } from './plans.controller';
import { AdminFeaturesController } from './features.controller';


@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    AdminService,
    UserService,
    SupportService,
    StripeService,
    PackageService,
    AddonsService,
    PlansService,
    FeaturesService,
  ],

  exports: [AdminService],
  controllers: [
    AdminMainController,
    AdminSupportController,
    AdminPackageController,
    AdminAddonsController,
    AdminLocationController,
    AdminPlansController,
    AdminFeaturesController,
  ],
})
export class AdminModule {}
