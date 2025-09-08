import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Body, 
  Query, 
  HttpStatus,
  HttpCode
} from "@nestjs/common";
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
  ApiProperty,
  ApiPropertyOptional
} from "@nestjs/swagger";
import { ForwardService } from "./forward.service";
import { ForwardRequestStatus, MailActionPriority } from "@prisma/client";
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsObject } from "class-validator";
import { 
  ForwardingQuoteResponseDto,
  ForwardingRequestResponseDto,
  BadRequestErrorDto,
  NotFoundErrorDto
} from './forward.swagger';
import { CurrentUser, Public } from "src/common/decorators";
import { CarrierService, PackagingOptionService, ShippingSpeedService } from "../shipping/shipping.service";

// DTOs
export class GetForwardingQuoteDto {
  @ApiProperty({ 
    description: 'Unique identifier of the mail item to forward',
    example: '25de0024-2ca9-4ed7-81f5-3dc468956c93',
    format: 'uuid'
  })
  @IsString()
  @IsNotEmpty()
  mailId: string;

  @ApiProperty({ 
    description: 'Unique identifier of the delivery address where mail will be forwarded',
    example: '943c9c3d-44f1-444f-bfee-b61497a50dda',
    format: 'uuid'
  })
  @IsString()
  @IsNotEmpty()
  deliveryAddressId: string;
}

export class CreateForwardingRequestDto {
  @ApiProperty({ description: 'Mail ID' })
  @IsString()
  @IsNotEmpty()
  mailId: string;

  @ApiProperty({ description: 'Delivery address ID' })
  @IsString()
  @IsNotEmpty()
  deliveryAddressId: string;

  @ApiProperty({ description: 'Delivery speed option ID' })
  @IsString()
  @IsNotEmpty()
  deliverySpeedOptionId: string;

  @ApiProperty({ description: 'Packaging type option ID' })
  @IsString()
  @IsNotEmpty()
  packagingTypeOptionId: string;

  @ApiPropertyOptional({ description: 'Local carrier ID (ignore for now)' })
  @IsString()
  @IsOptional()
  carrierId?: string;

  @ApiProperty({ description: 'Selected EasyPost rate details' })
  @IsObject()
  @IsNotEmpty()
  selectedRate: {
    id: string;
    carrier: string;
    service: string;
    rate: number; // cents cinsinden
    currency: string;
    delivery_days?: number;
    delivery_date?: string;
    delivery_date_guaranteed?: boolean;
    est_delivery_days?: number;
    list_rate?: number;
    retail_rate?: number;
    mode?: string;
    billing_type?: string;
    carrier_account_id?: string;
  };



  @ApiPropertyOptional({ description: 'Delivery speed fee in cents' })
  @IsNumber()
  @IsOptional()
  deliverySpeedFee?: number;

  @ApiPropertyOptional({ description: 'Packaging fee in cents' })
  @IsNumber()
  @IsOptional()
  packagingFee?: number;

  @ApiPropertyOptional({ description: 'Service fee in cents' })
  @IsNumber()
  @IsOptional()
  serviceFee?: number;

  @ApiPropertyOptional({ description: 'Priority' })
  @IsEnum(MailActionPriority)
  @IsOptional()
  priority?: MailActionPriority;
}

export class UpdateForwardingStatusDto {
  status: ForwardRequestStatus;
  reason?: string;
}

// Mail Handler Controller - Admin/Staff operations
@ApiTags('Mail Handler - Forward')
@ApiBearerAuth()
@Controller('mail-handler/forward')
export class MailHandlerForwardController {
  constructor(private readonly forwardService: ForwardService,
  ) {}

  @Get('requests')
  @ApiOperation({ 
    summary: 'Get forwarding requests for mail handler',
    description: 'Retrieves a list of forwarding requests for a specific office location. Mail handlers use this endpoint to see which packages need to be processed and shipped to customers.'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ForwardRequestStatus, 
    description: 'Filter requests by status (optional)',
    example: ForwardRequestStatus.PENDING
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of forwarding requests with mail details, delivery addresses, and shipping information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ca5b3aac-8e45-41e9-bfd1-98027d704bff' },
          status: { type: 'string', enum: Object.values(ForwardRequestStatus) },
          selectedCarrier: { type: 'string', example: 'USPS' },
          selectedService: { type: 'string', example: 'GroundAdvantage' },
          trackingCode: { type: 'string', example: '9434600208303110397236' },
          totalCost: { type: 'number', example: 12225 },
          createdAt: { type: 'string', format: 'date-time' },
          mail: { type: 'object' },
          deliveryAddress: { type: 'object' }
        }
      }
    }
  })
  async getForwardingRequests(
    @CurrentUser('assignedLocationId') officeLocationId: string,
    @Query('status') status?: ForwardRequestStatus,
  ) {
    return this.forwardService.getForwardingRequestsForHandler(officeLocationId, status);
  }


  @Get('requests/:id')
  @ApiOperation({ summary: 'Get forwarding request details' })
  @ApiParam({ name: 'id', description: 'Forwarding request ID' })
  @ApiResponse({ status: 200, description: 'Request details' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async getForwardingRequestDetails(@Param('id') requestId: string) {
    return this.forwardService.getForwardingRequestDetails(requestId);
  }

  @Put('requests/:id/complete')
  @ApiOperation({ 
    summary: 'Mark forwarding request as completed',
    description: 'Marks a forwarding request as completed after the mail handler has physically shipped the package to the carrier. This updates the request status and records the completion timestamp.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the forwarding request',
    example: 'ca5b3aac-8e45-41e9-bfd1-98027d704bff'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Forwarding request marked as completed successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string', example: 'COMPLETED' },
        completedAt: { type: 'string', format: 'date-time' },
        trackingCode: { type: 'string' },
        selectedCarrier: { type: 'string' },
        selectedService: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Forwarding request not found',
    type: NotFoundErrorDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Request is already completed',
    type: BadRequestErrorDto
  })
  async completeForwardingRequest(@Param('id') requestId: string) {
    return this.forwardService.completeForwardingRequest(requestId);
  }

  @Put('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel forwarding request' })
  @ApiParam({ name: 'id', description: 'Forwarding request ID' })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed request' })
  async cancelForwardingRequest(@Param('id') requestId: string) {
    return this.forwardService.cancelForwardingRequest(requestId);
  }

  @Get('requests/:id/track')
  @ApiOperation({ summary: 'Get forwarding request tracking details' })
  @ApiParam({ name: 'id', description: 'Forwarding request ID' })
  @ApiResponse({ status: 200, description: 'Request tracking details' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async getForwardingRequestTrackingDetails(@Param('id') requestId: string) {
    return this.forwardService.trackForwardingRequest(requestId);
  }
}

// User Controller - Customer operations
@ApiTags('Forward')
@ApiBearerAuth()
@Controller('forward')
export class ForwardController {
  constructor(private readonly forwardService: ForwardService,
    private readonly speedService: ShippingSpeedService,
    private readonly packagingService: PackagingOptionService,
    private readonly carrierService: CarrierService,
  ) {}

  @Post('quote')
  @ApiOperation({ 
    summary: 'Get forwarding quote for mail item',
    description: 'Retrieves shipping rates and options for forwarding a mail item to a specific delivery address. This endpoint calculates shipping costs from multiple carriers (USPS, UPS, FedEx, DHL) and returns available delivery speed and packaging options.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Forwarding quote with shipping rates, delivery options, and cost summary',
    type: ForwardingQuoteResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Mail item or delivery address not found',
    type: NotFoundErrorDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Mail dimensions are required for shipping quote calculation',
    type: BadRequestErrorDto
  })
  async getForwardingQuote(@Body() dto: GetForwardingQuoteDto) {
    return this.forwardService.getForwardingQuote(dto.mailId, dto.deliveryAddressId);
  }

  @Post('calculate-cost')
  @ApiOperation({ 
    summary: 'Calculate total forwarding cost',
    description: 'Calculates the total cost breakdown for forwarding a mail item including base shipping cost, delivery speed fees, packaging fees, and service fees. Use this before creating a forwarding request to show users the final cost.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed cost breakdown for the forwarding request',
    schema: {
      type: 'object',
      properties: {
        baseShippingCost: { type: 'number', example: 11800, description: 'EasyPost shipping cost in cents' },
        deliverySpeedFee: { type: 'number', example: 500, description: 'Delivery speed option fee in cents' },
        packagingFee: { type: 'number', example: 200, description: 'Packaging option fee in cents' },
        serviceFee: { type: 'number', example: 100, description: 'Platform service fee in cents' },
        totalCost: { type: 'number', example: 12600, description: 'Total cost in cents' }
      }
    }
  })
  async calculateForwardingCost(@Body() dto: {
    selectedRate: {
      id: string;
      carrier: string;
      service: string;
      rate: number;
      currency: string;
      delivery_days?: number;
      delivery_date?: string;
    };
    deliverySpeedOptionId: string;
    packagingTypeOptionId: string;
    officeLocationId: string;
    serviceFee?: number;
  }) {
    return this.forwardService.calculateForwardingCost(
      dto.selectedRate,
      dto.deliverySpeedOptionId,
      dto.packagingTypeOptionId,
      dto.officeLocationId,
      dto.serviceFee
    );
  }

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create forwarding request',
    description: 'Creates a forwarding request for a mail item. This endpoint purchases a shipping label from EasyPost, deducts the cost from workspace balance, and initiates the forwarding process. The mail handler will receive the request for physical processing.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Forwarding request created successfully with shipping label and tracking code',
    type: ForwardingRequestResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Mail item, delivery address, or related options not found',
    type: NotFoundErrorDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request data, rate no longer available, or price has changed significantly. Common errors: "Selected shipping option no longer available. Please get a new quote." or "Shipping price has changed from $X to $Y. Please get a new quote."',
    type: BadRequestErrorDto
  })
  async createForwardingRequest(@Body() dto: CreateForwardingRequestDto) {
    return this.forwardService.createForwardingRequest(dto);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get forwarding request details' })
  @ApiParam({ name: 'id', description: 'Forwarding request ID' })
  @ApiResponse({ status: 200, description: 'Request details' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async getForwardingRequest(@Param('id') requestId: string) {
    return this.forwardService.trackForwardingRequest(requestId);
  }

  @Get('requests/:id/track')
  @ApiOperation({ 
    summary: 'Track forwarding request',
    description: 'Retrieves real-time tracking information for a forwarding request from the shipping carrier. Provides detailed shipment status, location updates, and delivery progress.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the forwarding request',
    example: 'ca5b3aac-8e45-41e9-bfd1-98027d704bff'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tracking information with shipment status and location updates',
    schema: {
      type: 'object',
      properties: {
        forwardingRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            trackingCode: { type: 'string', example: '9434600208303110397236' },
            selectedCarrier: { type: 'string', example: 'USPS' },
            selectedService: { type: 'string', example: 'GroundAdvantage' },
            status: { type: 'string', enum: Object.values(ForwardRequestStatus) }
          }
        },
        trackingInfo: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            tracking_code: { type: 'string' },
            status: { type: 'string', example: 'in_transit' },
            status_detail: { type: 'string' },
            tracking_details: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Forwarding request not found',
    type: NotFoundErrorDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No tracking code available for this request',
    type: BadRequestErrorDto
  })
  async trackForwardingRequest(@Param('id') requestId: string) {
    return this.forwardService.trackForwardingRequest(requestId);
  }

  @Put('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel forwarding request' })
  @ApiParam({ name: 'id', description: 'Forwarding request ID' })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed request' })
  async cancelForwardingRequest(@Param('id') requestId: string) {
    return this.forwardService.cancelForwardingRequest(requestId);
  }



  @Public()
  @Get('speeds/:locationId')
  @ApiOperation({ summary: 'List active shipping speeds for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of speeds.' })
  async findSpeedOptions(@Param('locationId') locationId: string) {
    return await this.speedService.findAssigned(locationId);
  }

  @Public()
  @Get('packaging/:locationId')
  @ApiOperation({ summary: 'List active packaging options for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of packaging options.' })
  findPackagingOptions(@Param('locationId') locationId: string) {
    return this.packagingService.findAssigned(locationId);
  }

  @Public()
  @Get('carrier/:locationId')
  @ApiOperation({ summary: 'List active carriers for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of carriers.' })
  findAllCarriers(@Param('locationId') locationId: string) {
    return this.carrierService.findAssigned(locationId);
  }

}