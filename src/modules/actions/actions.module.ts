import { Global, Module } from '@nestjs/common';
import { MailActionsService } from './actions.service';
import { MailActionsController } from './actions.controller';
import { CarrierService, PackagingOptionService, ShippingSpeedService } from '../shipping/shipping.service';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';

@Global()
@Module({
  providers: [
    MailActionsService,
    PackagingOptionService, 
    ShippingSpeedService, 
    CarrierService,
    CaslAbilityFactory,
  ],
  exports: [MailActionsService],
  controllers: [MailActionsController],
})
export class MailActionsModule {}
