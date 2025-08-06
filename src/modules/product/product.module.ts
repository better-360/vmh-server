import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';

@Module({
  controllers: [ProductController, PriceController],
  providers: [ProductService, PriceService],
  exports: [ProductService, PriceService],
})
export class ProductModule {}