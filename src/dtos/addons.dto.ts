import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsUUID, IsInt, IsNumber, IsNotEmpty, IsArray, ValidateNested, Min, Max } from 'class-validator';

// =====================
// ADDON DTOs
// =====================

export class CreateAddonDto {
  @ApiProperty({
    description: 'Addon name',
    example: 'Extra Storage',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Addon description',
    example: 'Additional storage space for your packages',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe Product ID',
    example: 'prod_1234567890',
  })
  @IsString()
  @IsOptional()
  stripeProductId?: string;

  @ApiPropertyOptional({
    description: 'Addon image URL',
    example: 'https://example.com/addon-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Is addon active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAddonDto extends PartialType(CreateAddonDto) {
  @ApiPropertyOptional({
    description: 'Is addon deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class AddonResponseDto {
  @ApiProperty({
    description: 'Addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Addon name',
    example: 'Extra Storage',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Addon description',
    example: 'Additional storage space for your packages',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe Product ID',
    example: 'prod_1234567890',
  })
  stripeProductId?: string;

  @ApiPropertyOptional({
    description: 'Addon image URL',
    example: 'https://example.com/addon-image.png',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Is addon active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Is addon deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Deletion date',
    example: '2024-01-01T00:00:00.000Z',
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: 'Addon variants',
    type: [Object],
  })
  variants?: any[];
}

// =====================
// ADDON VARIANT DTOs
// =====================

export class CreateAddonVariantDto {
  @ApiProperty({
    description: 'Addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  addonId: string;

  @ApiProperty({
    description: 'Variant name',
    example: '10GB Storage',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Variant description',
    example: '10GB additional storage space',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe Price ID',
    example: 'price_1234567890',
  })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiProperty({
    description: 'Price in cents (e.g., 999 = $9.99)',
    example: 999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({
    description: 'Variant image URL',
    example: 'https://example.com/variant-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateAddonVariantForAddonDto {
  @ApiProperty({
    description: 'Variant name',
    example: '10GB Storage',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Variant description',
    example: '10GB additional storage space',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe Price ID',
    example: 'price_1234567890',
  })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiProperty({
    description: 'Price in cents (e.g., 999 = $9.99)',
    example: 999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({
    description: 'Variant image URL',
    example: 'https://example.com/variant-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateAddonWithVariantsDto {
  @ApiProperty({
    description: 'Addon name',
    example: 'Extra Storage',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Addon description',
    example: 'Additional storage space for your packages',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe Product ID',
    example: 'prod_1234567890',
  })
  @IsString()
  @IsOptional()
  stripeProductId?: string;

  @ApiPropertyOptional({
    description: 'Addon image URL',
    example: 'https://example.com/addon-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Is addon active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Addon variants to create',
    type: [CreateAddonVariantForAddonDto],
    example: [
      {
        name: "10GB Storage",
        description: "10GB additional storage space",
        price: 999,
        currency: "USD"
      },
      {
        name: "50GB Storage",
        description: "50GB additional storage space",
        price: 4999,
        currency: "USD"
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddonVariantForAddonDto)
  variants: CreateAddonVariantForAddonDto[];
}

export class UpdateAddonVariantDto extends PartialType(CreateAddonVariantDto) {
  @ApiPropertyOptional({
    description: 'Is variant deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class AddonVariantResponseDto {
  @ApiProperty({
    description: 'Variant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  addonId: string;

  @ApiProperty({
    description: 'Variant name',
    example: '10GB Storage',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Variant description',
    example: '10GB additional storage space',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe Price ID',
    example: 'price_1234567890',
  })
  stripePriceId?: string;

  @ApiProperty({
    description: 'Price in cents',
    example: 999,
  })
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Variant image URL',
    example: 'https://example.com/variant-image.png',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Is variant deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Deletion date',
    example: '2024-01-01T00:00:00.000Z',
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: 'Addon details',
    type: AddonResponseDto,
  })
  addon?: AddonResponseDto;
}

// =====================
// PLAN ADDON DTOs
// =====================

export class CreatePlanAddonDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  addonId: string;

  @ApiPropertyOptional({
    description: 'Is addon included in plan price',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isIncludedInPlan?: boolean;

  @ApiPropertyOptional({
    description: 'Discount percentage for plan holders (0-100)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'Is this addon required for the plan',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is plan addon active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreatePlanAddonForPlanDto {
  @ApiProperty({
    description: 'Addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  addonId: string;

  @ApiPropertyOptional({
    description: 'Is addon included in plan price',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isIncludedInPlan?: boolean;

  @ApiPropertyOptional({
    description: 'Discount percentage for plan holders (0-100)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'Is this addon required for the plan',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is plan addon active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePlanAddonDto extends PartialType(CreatePlanAddonDto) {
  @ApiPropertyOptional({
    description: 'Is plan addon deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class PlanAddonResponseDto {
  @ApiProperty({
    description: 'Plan addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  planId: string;

  @ApiProperty({
    description: 'Addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  addonId: string;

  @ApiProperty({
    description: 'Is addon included in plan price',
    example: false,
  })
  isIncludedInPlan: boolean;

  @ApiPropertyOptional({
    description: 'Discount percentage for plan holders',
    example: 20,
  })
  discountPercent?: number;

  @ApiProperty({
    description: 'Is this addon required for the plan',
    example: false,
  })
  isRequired: boolean;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 1,
  })
  displayOrder?: number;

  @ApiProperty({
    description: 'Is plan addon active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Is plan addon deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Deletion date',
    example: '2024-01-01T00:00:00.000Z',
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: 'Plan details',
    type: Object,
  })
  plan?: any;

  @ApiPropertyOptional({
    description: 'Addon details',
    type: AddonResponseDto,
  })
  addon?: AddonResponseDto;
}

// =====================
// QUERY DTOs
// =====================

export class AddonQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by deleted status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Search by name or description',
    example: 'storage',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class AddonVariantQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  addonId?: string;

  @ApiPropertyOptional({
    description: 'Filter by currency',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Filter by deleted status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class PlanAddonQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Filter by addon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  addonId?: string;

  @ApiPropertyOptional({
    description: 'Filter by included status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isIncludedInPlan?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by required status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by deleted status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// =====================
// BULK OPERATION DTOs
// =====================

export class BulkCreatePlanAddonsDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Array of plan addons to create',
    type: [CreatePlanAddonForPlanDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanAddonForPlanDto)
  addons: CreatePlanAddonForPlanDto[];
}

export class BulkUpdatePlanAddonsDto {
  @ApiProperty({
    description: 'Array of plan addon updates',
    type: [Object],
  })
  @IsArray()
  @ValidateNested({ each: true })
  addons: Array<{
    id: string;
    isIncludedInPlan?: boolean;
    discountPercent?: number;
    isRequired?: boolean;
    displayOrder?: number;
    isActive?: boolean;
  }>;
}
