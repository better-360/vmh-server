import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { StripeService } from '../stripe/stripe.service';

@Global()
@Module({
  providers: [UserService,StripeService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
