import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
  IsInt,
} from 'class-validator';
import { ProductType } from '@prisma/client';

// =====================
// PRODUCT DTOs
// =====================

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Extra Recipient',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Additional recipient for mail forwarding',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe product ID',
    example: 'prod_1234567890',
  })
  @IsString()
  @IsOptional()
  stripeProductId?: string;

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.ADDON,
  })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/product-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Is product active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'Is product deleted',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Extra Recipient',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Additional recipient for mail forwarding',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe product ID',
    example: 'prod_1234567890',
  })
  stripeProductId?: string;

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.ADDON,
  })
  type: ProductType;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/product-image.png',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Is product active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Is product deleted',
    example: false,
  })
  isDeleted: boolean;

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
    description: 'Product prices',
    type: [Object],
  })
  prices?: any[];

  @ApiPropertyOptional({
    description: 'Product features',
    type: [Object],
  })
  productFeature?: any[];

  @ApiPropertyOptional({
    description: 'Plan addons using this product',
    type: [Object],
  })
  planAddon?: any[];
}

// =====================
// PRICE DTOs
// =====================

export class CreatePriceDto {
  @ApiPropertyOptional({
    description: 'Price name',
    example: 'Monthly Extra Recipient',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Is default price',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Additional fees in cents',
    example: 50,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  additionalFees?: number;

  @ApiPropertyOptional({
    description: 'Stripe price ID',
    example: 'price_1234567890',
  })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiProperty({
    description: 'Unit amount in cents',
    example: 299,
  })
  @IsInt()
  @Min(0)
  unit_amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    description: 'Price description',
    example: 'Monthly subscription for extra recipient',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Recurring ID for recurring prices',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  recurringId?: string;
}

export class UpdatePriceDto extends PartialType(CreatePriceDto) {
  @ApiPropertyOptional({
    description: 'Is price active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Is price deleted',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class PriceResponseDto {
  @ApiProperty({
    description: 'Price ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Price name',
    example: 'Monthly Extra Recipient',
  })
  name?: string;

  @ApiProperty({
    description: 'Is default price',
    example: false,
  })
  isDefault: boolean;

  @ApiPropertyOptional({
    description: 'Additional fees in cents',
    example: 50,
  })
  additionalFees?: number;

  @ApiPropertyOptional({
    description: 'Stripe price ID',
    example: 'price_1234567890',
  })
  stripePriceId?: string;

  @ApiProperty({
    description: 'Unit amount in cents',
    example: 299,
  })
  unit_amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiPropertyOptional({
    description: 'Price description',
    example: 'Monthly subscription for extra recipient',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Recurring ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  recurringId?: string;

  @ApiProperty({
    description: 'Is price active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Is price deleted',
    example: false,
  })
  isDeleted: boolean;

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
    description: 'Product details',
  })
  product?: any;

  @ApiPropertyOptional({
    description: 'Recurring details',
  })
  recurring?: any;

  @ApiPropertyOptional({
    description: 'Plan addons using this price',
    type: [Object],
  })
  planAddons?: any[];
}