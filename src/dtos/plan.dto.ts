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
  IsJSON,
} from 'class-validator';
import { BillingCycle } from '@prisma/client';
import { CreatePlanAddonDto, PlanAddonResponseDto, PlanFeatureResponseDto, CreatePlanFeatureDto } from './plan_entitlements.dto';

// =====================
// PLAN DTOs
// =====================

export class CreatePlanDto {
  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeLocationId: string;

  @ApiProperty({
    description: 'Plan name',
    example: 'Basic Plan',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Plan slug',
    example: 'basic-plan',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Basic plan with essential features',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Plan image URL',
    example: 'https://example.com/plan-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Is plan active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Display features for UI (JSON format)',
    example: { 'highlights': ['Feature 1', 'Feature 2'] },
  })
  @IsOptional()
  displayFeatures?: any;

  @ApiPropertyOptional({
    description: 'Show on marketplace',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  showOnMarketplace?: boolean;
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiPropertyOptional({
    description: 'Is plan deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

// =====================
// PLAN PRICE DTOs
// =====================

export class CreatePlanPriceDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
    default: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @ApiProperty({
    description: 'Price amount in cents',
    example: 2999,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({
    description: 'Price description',
    example: 'Monthly subscription fee',
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

  @ApiPropertyOptional({
    description: 'Is price active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePlanPriceDto extends PartialType(CreatePlanPriceDto) {
  @ApiPropertyOptional({
    description: 'Is price deleted',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class PlanPriceResponseDto {
  @ApiProperty({
    description: 'Plan price ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  planId: string;

  @ApiProperty({
    description: 'Billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  @ApiProperty({
    description: 'Price amount in cents',
    example: 2999,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Price description',
    example: 'Monthly subscription fee',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe Price ID',
    example: 'price_1234567890',
  })
  stripePriceId?: string;

  @ApiProperty({
    description: 'Is price active',
    example: true,
  })
  isActive: boolean;

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
    description: 'Plan details',
  })
  plan?: any;

  @ApiPropertyOptional({
    description: 'Mailboxes using this price',
    type: [Object],
  })
  mailboxes?: any[];
}

// =====================
// PLAN RESPONSE DTOs
// =====================

export class PlanResponseDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  @ApiProperty({
    description: 'Office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  officeLocationId: string;

  @ApiProperty({
    description: 'Plan name',
    example: 'Basic Plan',
  })
  name: string;

  @ApiProperty({
    description: 'Plan slug',
    example: 'basic-plan',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Basic plan with essential features',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Plan image URL',
    example: 'https://example.com/plan-image.png',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Is plan active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Is plan deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Show on marketplace',
    example: true,
  })
  showOnMarketplace: boolean;

  @ApiPropertyOptional({
    description: 'Display features for UI',
  })
  displayFeatures?: any;

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
    description: 'Office location details',
  })
  officeLocation?: any;

  @ApiPropertyOptional({
    description: 'Plan features',
    type: [PlanFeatureResponseDto],
  })
  features?: PlanFeatureResponseDto[];

  @ApiPropertyOptional({
    description: 'Plan prices',
    type: [PlanPriceResponseDto],
  })
  prices?: PlanPriceResponseDto[];

  @ApiPropertyOptional({
    description: 'Plan addons',
    type: [PlanAddonResponseDto],
  })
  addons?: PlanAddonResponseDto[];

  @ApiPropertyOptional({
    description: 'Mailboxes using this plan',
    type: [Object],
  })
  mailboxes?: any[];
}

// =====================
// COMPLETE PLAN WITH FEATURES DTOs
// =====================

export class CreateCompletePlanDto {
  @ApiProperty({
    description: 'Basic plan information',
    type: CreatePlanDto,
  })
  @ValidateNested()
  @Type(() => CreatePlanDto)
  plan: CreatePlanDto;

  @ApiPropertyOptional({
    description: 'Plan prices',
    type: [CreatePlanPriceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanPriceDto)
  @IsOptional()
  prices?: Omit<CreatePlanPriceDto, 'planId'>[];

  @ApiPropertyOptional({
    description: 'Plan features',
    type: [CreatePlanFeatureDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanFeatureDto)
  @IsOptional()
  features?: Omit<CreatePlanFeatureDto, 'planId'>[];

  @ApiPropertyOptional({
    description: 'Plan addons',
    type: [CreatePlanAddonDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanAddonDto)
  @IsOptional()
  addons?: Omit<CreatePlanAddonDto, 'planId'>[];
}


// =====================
// COMPOSITE DTOs
// =====================

export class CreatePlanWithFeaturesDto {
  @ApiProperty({ description: 'Plan creation data' })
  @ValidateNested()
  @Type(() => CreatePlanDto)
  plan: CreatePlanDto;

  @ApiPropertyOptional({
    description: 'Plan features to include',
    type: [CreatePlanFeatureDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanFeatureDto)
  @IsOptional()
  features?: CreatePlanFeatureDto[];

  @ApiPropertyOptional({
    description: 'Plan prices to include',
    type: [CreatePlanPriceDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanPriceDto)
  @IsOptional()
  prices?: CreatePlanPriceDto[];
}