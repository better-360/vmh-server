import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { DeliveryAddressType } from '@prisma/client';

// =====================
// DELIVERY ADDRESS DTOs
// =====================

export class CreateDeliveryAddressDto {
  @ApiProperty({
    description: 'Address type',
    enum: DeliveryAddressType,
    example: DeliveryAddressType.DELIVERY,
    default: DeliveryAddressType.DELIVERY,
  })
  @IsEnum(DeliveryAddressType)
  @IsOptional()
  type?: DeliveryAddressType;

  @ApiProperty({
    description: 'Mailbox ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  mailBoxId: string;

  @ApiProperty({
    description: 'Address label',
    example: 'Home Address',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Address line',
    example: '123 Main Street, Apt 4B',
  })
  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({
    description: 'ZIP code',
    example: '10001',
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Is default address',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Is address confirmed',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isConfirmed?: boolean;
}

export class UpdateDeliveryAddressDto extends PartialType(CreateDeliveryAddressDto) {}

export class DeliveryAddressResponseDto {
  @ApiProperty({
    description: 'Delivery address ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Address type',
    enum: DeliveryAddressType,
    example: DeliveryAddressType.DELIVERY,
  })
  type: DeliveryAddressType;

  @ApiProperty({
    description: 'Mailbox ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  mailBoxId: string;

  @ApiProperty({
    description: 'Address label',
    example: 'Home Address',
  })
  label: string;

  @ApiProperty({
    description: 'Address line',
    example: '123 Main Street, Apt 4B',
  })
  addressLine: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'NY',
  })
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
  })
  country: string;

  @ApiPropertyOptional({
    description: 'ZIP code',
    example: '10001',
  })
  zipCode?: string;

  @ApiProperty({
    description: 'Is default address',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Is address confirmed',
    example: false,
  })
  isConfirmed: boolean;

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
    description: 'Deleted at',
    example: '2024-01-01T00:00:00.000Z',
  })
  deletedAt?: Date;

  // Relations
  @ApiPropertyOptional({
    description: 'Mailbox details',
  })
  mailbox?: any;

  @ApiPropertyOptional({
    description: 'Forwarding requests using this address',
    type: [Object],
  })
  forwardRequests?: any[];
}