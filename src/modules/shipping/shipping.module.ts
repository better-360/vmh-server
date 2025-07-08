import { Module } from '@nestjs/common';
import {
  PackagingOptionService,
  ShippingSpeedService,
  CarrierService,
} from './shipping.service';
import {
  CarrierController,
  PackagingOptionController,
  ShippingSpeedController,
} from './shipping.controller';

@Module({
controllers: [
    ShippingSpeedController,
    PackagingOptionController,
    CarrierController,
  ],
  providers: [
    PackagingOptionService,
    ShippingSpeedService,
    CarrierService,
    PackagingOptionService,
  ]
})
export class ShippingModule {}
