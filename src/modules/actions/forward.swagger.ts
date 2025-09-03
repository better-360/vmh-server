import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MailActionPriority, ForwardRequestStatus } from '@prisma/client';

// =====================
// REQUEST DTOs
// =====================

export class GetForwardingQuoteSwaggerDto {
  @ApiProperty({ 
    description: 'Unique identifier of the mail item to forward',
    example: '25de0024-2ca9-4ed7-81f5-3dc468956c93',
    format: 'uuid'
  })
  mailId: string;

  @ApiProperty({ 
    description: 'Unique identifier of the delivery address where mail will be forwarded',
    example: '943c9c3d-44f1-444f-bfee-b61497a50dda',
    format: 'uuid'
  })
  deliveryAddressId: string;
}

export class SelectedRateSwaggerDto {
  @ApiProperty({
    description: 'EasyPost rate identifier',
    example: 'rate_8c3f4e9df6a24dbebccc463523b6e2ae'
  })
  id: string;

  @ApiProperty({
    description: 'Shipping carrier name',
    example: 'USPS',
    enum: ['USPS', 'UPS', 'FedEx', 'DHL']
  })
  carrier: string;

  @ApiProperty({
    description: 'Shipping service type',
    example: 'GroundAdvantage'
  })
  service: string;

  @ApiProperty({
    description: 'Shipping rate in cents (e.g., 11800 = $118.00)',
    example: 11800,
    minimum: 1
  })
  rate: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    default: 'USD'
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Estimated delivery days',
    example: 2,
    minimum: 1
  })
  delivery_days?: number;

  @ApiPropertyOptional({
    description: 'Estimated delivery date (ISO format)',
    example: '2025-01-15',
    format: 'date'
  })
  delivery_date?: string;

  @ApiPropertyOptional({
    description: 'Whether delivery date is guaranteed',
    example: false
  })
  delivery_date_guaranteed?: boolean;

  @ApiPropertyOptional({
    description: 'Alternative estimated delivery days',
    example: 2
  })
  est_delivery_days?: number;

  @ApiPropertyOptional({
    description: 'List rate in cents',
    example: 11800
  })
  list_rate?: number;

  @ApiPropertyOptional({
    description: 'Retail rate in cents',
    example: 12100
  })
  retail_rate?: number;

  @ApiPropertyOptional({
    description: 'EasyPost mode (test or production)',
    example: 'test',
    enum: ['test', 'production']
  })
  mode?: string;

  @ApiPropertyOptional({
    description: 'Billing type',
    example: 'easypost'
  })
  billing_type?: string;

  @ApiPropertyOptional({
    description: 'EasyPost carrier account identifier',
    example: 'ca_e8ab406158c3496198a66c4f58cc58e4'
  })
  carrier_account_id?: string;
}

export class CreateForwardingRequestSwaggerDto {
  @ApiProperty({ 
    description: 'Unique identifier of the mail item to forward',
    example: '25de0024-2ca9-4ed7-81f5-3dc468956c93',
    format: 'uuid'
  })
  mailId: string;

  @ApiProperty({ 
    description: 'Unique identifier of the mailbox that owns the mail',
    example: '90597468-2ddb-40e8-99ff-8c0044fa10cd',
    format: 'uuid'
  })
  mailboxId: string;

  @ApiProperty({ 
    description: 'Unique identifier of the delivery address where mail will be forwarded',
    example: '943c9c3d-44f1-444f-bfee-b61497a50dda',
    format: 'uuid'
  })
  deliveryAddressId: string;

  @ApiProperty({ 
    description: 'Unique identifier of the delivery speed option',
    example: '7772b11d-afb0-4281-a054-a9249a051144',
    format: 'uuid'
  })
  deliverySpeedOptionId: string;

  @ApiProperty({ 
    description: 'Unique identifier of the packaging type option',
    example: '37bba193-77b1-4fa5-af5a-83aebb3266d1',
    format: 'uuid'
  })
  packagingTypeOptionId: string;

  @ApiProperty({ 
    description: 'Selected EasyPost shipping rate details from quote response',
    type: SelectedRateSwaggerDto
  })
  selectedRate: SelectedRateSwaggerDto;

  @ApiPropertyOptional({ 
    description: 'Additional fee for delivery speed option in cents',
    example: 0,
    minimum: 0,
    default: 0
  })
  deliverySpeedFee?: number;

  @ApiPropertyOptional({ 
    description: 'Additional fee for packaging option in cents',
    example: 0,
    minimum: 0,
    default: 0
  })
  packagingFee?: number;

  @ApiPropertyOptional({ 
    description: 'Platform service fee in cents',
    example: 10,
    minimum: 0,
    default: 0
  })
  serviceFee?: number;

  @ApiPropertyOptional({ 
    description: 'Priority level for processing the forwarding request',
    enum: MailActionPriority,
    example: MailActionPriority.STANDARD,
    default: MailActionPriority.STANDARD
  })
  priority?: MailActionPriority;
}

// =====================
// RESPONSE DTOs
// =====================

export class ShippingRateResponseDto {
  @ApiProperty({
    description: 'EasyPost rate identifier',
    example: 'rate_8c3f4e9df6a24dbebccc463523b6e2ae'
  })
  id: string;

  @ApiProperty({
    description: 'Shipping carrier name',
    example: 'USPS'
  })
  carrier: string;

  @ApiProperty({
    description: 'Shipping service type',
    example: 'GroundAdvantage'
  })
  service: string;

  @ApiProperty({
    description: 'Shipping rate in cents',
    example: 11800
  })
  rate: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD'
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Estimated delivery days',
    example: 2
  })
  delivery_days?: number;

  @ApiPropertyOptional({
    description: 'Estimated delivery date',
    example: '2025-01-15'
  })
  delivery_date?: string;

  @ApiPropertyOptional({
    description: 'Whether delivery date is guaranteed',
    example: false
  })
  delivery_date_guaranteed?: boolean;
}

export class QuoteSummaryDto {
  @ApiProperty({
    description: 'Total number of shipping rates found',
    example: 3
  })
  totalRatesFound: number;

  @ApiProperty({
    description: 'Cheapest shipping rate available',
    type: ShippingRateResponseDto,
    nullable: true
  })
  cheapestRate: ShippingRateResponseDto | null;

  @ApiProperty({
    description: 'Fastest shipping rate available',
    type: ShippingRateResponseDto,
    nullable: true
  })
  fastestRate: ShippingRateResponseDto | null;

  @ApiProperty({
    description: 'List of available shipping carriers',
    example: ['USPS', 'UPS', 'FedEx'],
    type: [String]
  })
  availableCarriers: string[];

  @ApiProperty({
    description: 'Average price across all rates in cents',
    example: 15000
  })
  averagePrice: number;

  @ApiProperty({
    description: 'Price range for all available rates',
    example: { min: 11800, max: 25000 }
  })
  priceRange: {
    min: number;
    max: number;
  };
}

export class DeliverySpeedOptionDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '7772b11d-afb0-4281-a054-a9249a051144'
  })
  id: string;

  @ApiProperty({
    description: 'Speed option label',
    example: 'FAST'
  })
  label: string;

  @ApiProperty({
    description: 'Human-readable title',
    example: 'Fastest Delivery'
  })
  title: string;

  @ApiProperty({
    description: 'Additional fee in cents',
    example: 500
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Option description',
    example: 'Delivered within 3 business days'
  })
  description?: string;
}

export class PackagingTypeOptionDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '37bba193-77b1-4fa5-af5a-83aebb3266d1'
  })
  id: string;

  @ApiProperty({
    description: 'Packaging type label',
    example: 'STANDARD_BOX'
  })
  label: string;

  @ApiProperty({
    description: 'Human-readable title',
    example: 'Standard Box'
  })
  title: string;

  @ApiProperty({
    description: 'Additional fee in cents',
    example: 200
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Packaging description',
    example: 'A standard cardboard box'
  })
  description?: string;
}

export class ForwardingQuoteResponseDto {
  @ApiProperty({
    description: 'Available shipping rates from EasyPost',
    type: [ShippingRateResponseDto]
  })
  rates: ShippingRateResponseDto[];

  @ApiProperty({
    description: 'Summary statistics for the quote',
    type: QuoteSummaryDto
  })
  summary: QuoteSummaryDto;

  @ApiProperty({
    description: 'Available delivery speed options',
    type: [DeliverySpeedOptionDto]
  })
  deliverySpeedOptions: DeliverySpeedOptionDto[];

  @ApiProperty({
    description: 'Available packaging type options',
    type: [PackagingTypeOptionDto]
  })
  packagingTypeOptions: PackagingTypeOptionDto[];

  @ApiProperty({
    description: 'Mail item details'
  })
  mail: any;

  @ApiProperty({
    description: 'Delivery address details'
  })
  deliveryAddress: any;

  @ApiProperty({
    description: 'Office location details'
  })
  officeLocation: any;
}

export class CostBreakdownDto {
  @ApiProperty({
    description: 'Base shipping cost from EasyPost in cents',
    example: 11800
  })
  baseShippingCost: number;

  @ApiProperty({
    description: 'Delivery speed fee in cents',
    example: 0
  })
  deliverySpeedFee: number;

  @ApiProperty({
    description: 'Packaging fee in cents',
    example: 0
  })
  packagingFee: number;

  @ApiProperty({
    description: 'Platform service fee in cents',
    example: 10
  })
  serviceFee: number;

  @ApiProperty({
    description: 'Total cost in cents',
    example: 11810
  })
  totalCost: number;
}

export class ForwardingRequestResponseDto {
  @ApiProperty({
    description: 'Unique forwarding request identifier',
    example: 'ca5b3aac-8e45-41e9-bfd1-98027d704bff'
  })
  id: string;

  @ApiProperty({
    description: 'Mail item identifier',
    example: '25de0024-2ca9-4ed7-81f5-3dc468956c93'
  })
  mailId: string;

  @ApiProperty({
    description: 'EasyPost rate identifier used',
    example: 'rate_8c3f4e9df6a24dbebccc463523b6e2ae'
  })
  easypostRateId: string;

  @ApiProperty({
    description: 'EasyPost shipment identifier',
    example: 'shp_8556fdceae3d459e9b3d1d5d16403fe2'
  })
  easypostShipmentId: string;

  @ApiProperty({
    description: 'Selected shipping carrier',
    example: 'USPS'
  })
  selectedCarrier: string;

  @ApiProperty({
    description: 'Selected shipping service',
    example: 'GroundAdvantage'
  })
  selectedService: string;

  @ApiProperty({
    description: 'Tracking code for the shipment',
    example: '9434600208303110397236'
  })
  trackingCode: string;

  @ApiProperty({
    description: 'URL to download shipping label',
    example: 'https://easypost-files.s3.us-west-2.amazonaws.com/files/postage_label/20250903/e87bcad9fa5d9048b285fe44579095966c.png'
  })
  labelUrl: string;

  @ApiProperty({
    description: 'Request status',
    enum: ForwardRequestStatus,
    example: ForwardRequestStatus.PENDING
  })
  status: ForwardRequestStatus;

  @ApiProperty({
    description: 'Cost breakdown details',
    type: CostBreakdownDto
  })
  costBreakdown: CostBreakdownDto;

  @ApiProperty({
    description: 'Request creation timestamp',
    example: '2025-09-03T14:47:18.620Z'
  })
  createdAt: string;

  @ApiProperty({
    description: 'Mail item details'
  })
  mail: any;

  @ApiProperty({
    description: 'Delivery address details'
  })
  deliveryAddress: any;

  @ApiProperty({
    description: 'Delivery speed option details'
  })
  deliverySpeedOption: any;

  @ApiProperty({
    description: 'Packaging type option details'
  })
  packagingTypeOption: any;
}

// =====================
// ERROR RESPONSES
// =====================

export class BadRequestErrorDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Selected rate no longer available. Please get a new quote.'
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request'
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;
}

export class NotFoundErrorDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Mail not found'
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Not Found'
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 404
  })
  statusCode: number;
}
