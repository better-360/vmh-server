import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ForwardRequestStatus, PaymentStatus } from '@prisma/client';

// =====================
// FORWARDING REQUEST DTOs
// =====================

export class CreateForwardingRequestDto {
  @ApiProperty({
    description: 'Mail ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  mailId: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({
    description: 'Office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeLocationId: string;

  @ApiProperty({
    description: 'Delivery address ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  deliveryAddressId: string;

  @ApiProperty({
    description: 'Delivery speed option ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  deliverySpeedOptionId: string;

  @ApiProperty({
    description: 'Packaging type option ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  packagingTypeOptionId: string;

  @ApiPropertyOptional({
    description: 'Carrier ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  carrierId?: string;

  @ApiProperty({
    description: 'Shipping cost in cents',
    example: 1200,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  shippingCost: number;

  @ApiProperty({
    description: 'Packaging cost in cents',
    example: 200,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  packagingCost: number;

  @ApiProperty({
    description: 'Total cost in cents',
    example: 1400,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  totalCost: number;

  @ApiPropertyOptional({
    description: 'Tracking code from carrier',
    example: '1Z12345E0292828283',
  })
  @IsString()
  @IsOptional()
  trackingCode?: string;

  @ApiPropertyOptional({
    description: 'Request status',
    enum: ForwardRequestStatus,
    example: ForwardRequestStatus.PENDING,
    default: ForwardRequestStatus.PENDING,
  })
  @IsEnum(ForwardRequestStatus)
  @IsOptional()
  status?: ForwardRequestStatus;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    default: PaymentStatus.PENDING,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}

export class UpdateForwardingRequestDto extends PartialType(CreateForwardingRequestDto) {
  @ApiPropertyOptional({
    description: 'Completed at',
    example: '2024-01-01T15:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @ApiPropertyOptional({
    description: 'Cancelled at',
    example: '2024-01-01T15:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  cancelledAt?: string;
}

export class ForwardingRequestResponseDto {
  @ApiProperty({
    description: 'Forwarding request ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Mail ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  mailId: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  officeLocationId: string;

  @ApiProperty({
    description: 'Delivery address ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  deliveryAddressId: string;

  @ApiProperty({
    description: 'Delivery speed option ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  deliverySpeedOptionId: string;

  @ApiProperty({
    description: 'Packaging type option ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  packagingTypeOptionId: string;

  @ApiPropertyOptional({
    description: 'Carrier ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  carrierId?: string;

  @ApiPropertyOptional({
    description: 'Tracking code from carrier',
    example: '1Z12345E0292828283',
  })
  trackingCode?: string;

  @ApiProperty({
    description: 'Shipping cost in cents',
    example: 1200,
  })
  shippingCost: number;

  @ApiProperty({
    description: 'Packaging cost in cents',
    example: 200,
  })
  packagingCost: number;

  @ApiProperty({
    description: 'Total cost in cents',
    example: 1400,
  })
  totalCost: number;

  @ApiProperty({
    description: 'Request status',
    enum: ForwardRequestStatus,
    example: ForwardRequestStatus.PENDING,
  })
  status: ForwardRequestStatus;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Created at',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Completed at',
    example: '2024-01-01T15:30:00.000Z',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Cancelled at',
    example: '2024-01-01T15:30:00.000Z',
  })
  cancelledAt?: Date;

  // Relations
  @ApiPropertyOptional({
    description: 'Mail details',
  })
  mail?: any;

  @ApiPropertyOptional({
    description: 'Mailbox details',
  })
  subscription?: any;

  @ApiPropertyOptional({
    description: 'Office location details',
  })
  officeLocation?: any;

  @ApiPropertyOptional({
    description: 'Delivery address details',
  })
  deliveryAddress?: any;

  @ApiPropertyOptional({
    description: 'Delivery speed option details',
  })
  deliverySpeedOption?: any;

  @ApiPropertyOptional({
    description: 'Packaging type option details',
  })
  packagingTypeOption?: any;

  @ApiPropertyOptional({
    description: 'Carrier details',
  })
  carrier?: any;
}