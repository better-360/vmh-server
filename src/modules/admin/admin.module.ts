import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HttpModule } from '@nestjs/axios';
import { AdminSupportController } from './support.controller';
import { AdminMainController } from './admin.controller';
import { SupportService } from '../support/support.service';
import { StripeService } from '../stripe/stripe.service';
import { AdminPackageController } from './mail.controller';
import { MailService } from '../mail/mail.service';
import { MarketService } from '../catalog/market.service';
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
    MailService,
    MarketService,
    PlansService,
    FeaturesService,
    MarketService,
  ],

  exports: [AdminService],
  controllers: [
    AdminMainController,
    AdminSupportController,
    AdminPackageController,
    AdminLocationController,
    AdminPlansController,
    AdminFeaturesController,
  ],
})
export class AdminModule {}
