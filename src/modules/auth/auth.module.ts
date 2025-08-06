import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TokenService } from './token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EmailVerifyService } from './verify.service';
import { PasswordResetService } from './reset.service';
import { StripeService } from '../stripe/stripe.service';
import { JwtStrategy } from './strategies/jwt.strategy';
// import { BillingService } from '../billing/billing.service'; // Disabled

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],
  providers: [AuthService, TokenService,JwtStrategy,EmailVerifyService,PasswordResetService,StripeService], // BillingService disabled
  controllers: [AuthController],
})
export class AuthModule {}
