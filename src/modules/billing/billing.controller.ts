import {
  Controller,
  Body,
  Post,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  Param,
  Request,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { BillingService } from './billing.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from 'src/dtos/checkout.dto';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
  ) {}


  @ApiOperation({ summary: 'Create initial subscription order' })
  @Public()
  @Post('create-initial-subscription-order')
  async createInitialSubscriptionOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.billingService.createInitialSubscriptionOrder(createOrderDto);
  }

  @ApiOperation({ summary: 'Stripe Checkout Session tamamlanınca gelir' })
  @Public()
  @Get('checkout-completed')
  async handleStripeSuccess(@Query('session_id') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('Session ID is missing');
    }
    return await this.billingService.handleCheckOutSessionCompleted(sessionId);
  }

  // @ApiOperation({ summary: 'Stripe Checkout Session oluşturur(Tek ürün satın alımları için)' })
  // @Post('create-checkout-session')
  // async createCheckoutSession(@Req() req: any, @Body() data:PurchareSingleItemDataDto) {
  //   return await this.billingService.createSingleItemCheckout(req.user, data);
  // }

}
