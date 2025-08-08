import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { StripeService } from '../stripe/stripe.service';

@Module({
  controllers: [ProductController, PriceController],
  providers: [ProductService, PriceService, StripeService],
  exports: [ProductService, PriceService],
})
export class ProductModule {}