import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { PriceService } from './price.service';
import { StripeService } from '../stripe/stripe.service';

@Module({
  controllers: [],
  providers: [ProductService, PriceService, StripeService],
  exports: [ProductService, PriceService],
})
export class ProductModule {}