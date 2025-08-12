import { Global, Module } from '@nestjs/common';
import { MailActionsService } from './actions.service';
import { MailActionsController } from './actions.controller';
import { CarrierService, PackagingOptionService, ShippingSpeedService } from '../shipping/shipping.service';

@Global()
@Module({
  providers: [MailActionsService,PackagingOptionService, ShippingSpeedService, CarrierService],
  exports: [MailActionsService],
  controllers: [MailActionsController],
})
export class MailActionsModule {}
