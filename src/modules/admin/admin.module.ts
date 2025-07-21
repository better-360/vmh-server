import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HttpModule } from '@nestjs/axios';
import { AdminSupportController } from './support/support.admin.controller';
import { AdminMainController } from './admin.controller';
import { SupportService } from '../support/support.service';
import { StripeService } from '../stripe/stripe.service';
import { AdminPackageController } from './package.controller';
import { PackageService } from '../package/package.service';


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
  ],

  exports: [AdminService],
  controllers: [
    AdminSupportController,
    AdminMainController,
    AdminPackageController,
  ],
})
export class AdminModule {}
