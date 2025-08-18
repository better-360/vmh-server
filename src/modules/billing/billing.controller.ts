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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateInitialSubscriptionOrderDto, CreateOrderDto } from 'src/dtos/checkout.dto';
import { StripeService } from '../stripe/stripe.service';
import { BillingService } from './billing.service';

@Public()
@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly stripeService: StripeService,
  ) {}


  @ApiOperation({ summary: 'Create initial subscription order' })
  @Post('init')
  async createInitialSubscriptionOrder(@Body() createOrderDto: CreateInitialSubscriptionOrderDto) {
    return this.billingService.createInitialSubscriptionOrder(createOrderDto);
  }

  @ApiOperation({ summary: 'Create order' })
  @Public()
  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user.id;
    const workspaceId = req.user.workspaces[0].workspaceId;
    throw new BadRequestException('Billing service temporarily disabled during schema migration');
  }

  @Get('check-payment')
  @ApiOperation({ summary: 'Check payment status by intent ID' })
  async checkPaymentStatus(@Query('intentId') intentId: string) {
  const paymentIntent = await this.stripeService.retrievePaymentIntent(intentId);
  console.log('paymentIntent', paymentIntent);
  if (!paymentIntent) throw new NotFoundException('Order not found');
  return { status: paymentIntent.status }; // success, failed, pending...
}

  @Get('public-key')
  getPublishableKey() {
    return { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY };
  }
}
