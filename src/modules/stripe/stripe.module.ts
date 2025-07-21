import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';


@Module({
    imports: [HttpModule,ConfigModule],
    providers: [ StripeService],
    controllers: [StripeController],
})
export class StripeModule {}
