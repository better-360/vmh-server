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
  NotFoundException,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { BillingService } from './billing.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateInitialSubscriptionOrderDto, CreateOrderDto } from 'src/dtos/checkout.dto';
import { StripeService } from '../stripe/stripe.service';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly stripeService: StripeService,
  ) {}


  @ApiOperation({ summary: 'Create initial subscription order' })
  @Public()
  @Post('create-initial-subscription-order')
  async createInitialSubscriptionOrder(@Body() createOrderDto: CreateInitialSubscriptionOrderDto) {
    return await this.billingService.createInitialSubscriptionOrder(createOrderDto);
  }

  @ApiOperation({ summary: 'Create initial subscription order' })
  @Public()
  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user.id;
    const workspaceId = req.user.workspaces[0].workspaceId;
    return await this.billingService.createOrder(createOrderDto, userId, workspaceId);
  }

  @Get('check-payment')
  async checkPaymentStatus(@Query('intentId') intentId: string) {
  const paymentIntent = await this.stripeService.retrievePaymentIntent(intentId);
  console.log('paymentIntent', paymentIntent);
  if (!paymentIntent) throw new NotFoundException('Order not found');
  return { status: paymentIntent.status }; // success, failed, pending...
}


}
