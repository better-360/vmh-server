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
import { AdminProductController } from './product.controller';
import { AdminPriceController } from './price.controller';
import { ProductService } from '../product/product.service';
import { PriceService } from '../product/price.service';
import { CarrierService, PackagingOptionService, ShippingSpeedService } from '../shipping/shipping.service';
import { AdminCarrierController, AdminPackagingOptionController, AdminShippingSpeedController } from './shipping.controller';
import { MailboxService } from '../mailbox/mailbox.service';
import { AdminMailboxController } from './mailbox.controller';
import { AdminWorkspaceController } from './workspace.controller';
import { WorkspaceService } from '../workspace/workspace.service';
import { AdminMailController } from './mail.controller';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';


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
    ProductService,
    PriceService,
    ShippingSpeedService,
    PackagingOptionService,
    CarrierService,
    MailboxService,
    WorkspaceService,
    CaslAbilityFactory,
  ],

  exports: [AdminService],
  controllers: [
    AdminMainController,
    AdminSupportController,
    AdminLocationController,
    AdminPlansController,
    PlanAddonsController,
    AdminFeaturesController,
    PlanFeaturesController,
    AdminProductController,
    AdminPriceController,
    AdminShippingSpeedController,
    AdminCarrierController,
    AdminPackagingOptionController,
    AdminMailboxController,
    AdminWorkspaceController,
    AdminMailController
  ],
})
export class AdminModule {}
