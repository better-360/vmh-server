import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { MailModule } from './mail/mail.module';
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

g@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CaslModule,
    PrismaModule,
    AuthModule,
    UserModule,
    FileManagerModule,
    MailModule,
    AdminModule,
    HttpModule,
    SupportModule,
    StripeModule,
    SchedulerModule,
    CatalogModule,
    ReportModule,
    SubscriptionModule,
  ],
  exports: [
    AuthModule,
    UserModule,
    FileManagerModule,
    MailModule,
    AdminModule,
    SupportModule,
    StripeModule,
    SchedulerModule,
    CatalogModule,
    ReportModule,
    SubscriptionModule
  ],
})
export class MainModule {}
