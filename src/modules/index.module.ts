import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { EmailModule } from './email/email.module';
import { HttpModule } from '@nestjs/axios';
import { SupportModule } from './support/support.module';
import { StripeModule } from './stripe/stripe.module';
import { PrismaModule } from 'src/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CaslModule } from 'src/authorization/casl/casl.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { CatalogModule } from './catalog/catalog.module';
import { ReportModule } from './report/report.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ShippingModule } from './shipping/shipping.module';
import { MailModule } from './mail/mail.module';
import { BillingModule } from './billing/billing.module';
import { EasyPostModule } from './easypost/easypost.module';
import { MailboxModule } from './mailbox/mailbox.module';
import { ProductModule } from './product/product.module';
import { HandlerModule } from './handler/handler.module';
import { EntitlementsModule } from './entitlements/entitlements.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CaslModule,
    PrismaModule,
    AuthModule,
    UserModule,
    FileManagerModule,
    EmailModule,
    AdminModule,
    HttpModule,
    SupportModule,
    StripeModule,
    SchedulerModule,
    CatalogModule,
    ReportModule,
    SubscriptionModule,
    ShippingModule,
    WorkspaceModule,
    MailModule,
    BillingModule,
    EasyPostModule,
    MailboxModule,
    ProductModule,
    HandlerModule,
    EntitlementsModule
  ],
  exports: [
    AuthModule,
    UserModule,
    FileManagerModule,
    EmailModule,
    AdminModule,
    SupportModule,
    StripeModule,
    SchedulerModule,
    CatalogModule,
    ReportModule,
    SubscriptionModule,
    ShippingModule,
    WorkspaceModule,
    MailModule,
    BillingModule,
    EasyPostModule,
    MailboxModule,
    ProductModule,
    HandlerModule,
    EntitlementsModule
  ],
})
export class MainModule {}
