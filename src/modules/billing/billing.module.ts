import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BillingService } from './billing.service';
import { StripeService } from '../stripe/stripe.service';
import { BillingController } from './billing.controller';
import { UserService } from '../user/user.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { LocationService } from '../catalog/location.service';
import { PlansService } from '../catalog/plans.service';

@Module({
    imports: [HttpModule],
    providers: [
        BillingService,
        StripeService,
        UserService,
        WorkspaceService,
        SubscriptionService,
        LocationService,
        PlansService
    ],
    controllers: [BillingController],
})
export class BillingModule {}