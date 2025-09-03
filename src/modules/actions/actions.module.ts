import { Global, Module } from '@nestjs/common';
import { MailActionsService } from './actions.service';
import { MailActionsController } from './actions.controller';
import { CarrierService, PackagingOptionService, ShippingSpeedService } from '../shipping/shipping.service';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';
import { ForwardController, MailHandlerForwardController } from './forward.controller';
import { ForwardService } from './forward.service';
import { EasyPostModule } from '../easypost/easypost.module';

@Global()
@Module({
  imports: [EasyPostModule],
  providers: [
    MailActionsService,
    PackagingOptionService, 
    ShippingSpeedService, 
    CarrierService,
    CaslAbilityFactory,
    ForwardService
  ],
  exports: [MailActionsService, ForwardService],
  controllers: [MailActionsController, ForwardController, MailHandlerForwardController],
})
export class MailActionsModule {}
