import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
  Max,
  IsObject,
} from 'class-validator';
import { BillingCycle } from '@prisma/client';
import { CreatePlanAddonDto, PlanAddonResponseDto, PlanFeatureResponseDto, CreatePlanFeatureDto } from './plan_entitlements.dto';
import { JsonValue } from '@prisma/client/runtime/library';

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
 
  @ApiProperty({
    description: 'Planın detaylı açıklaması (Rich Text Editor JSON formatı)',
    type: 'object',
    required: false,
    example: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Detaylı plan açıklaması.' }] }] },
  })
  @IsOptional()
  @IsObject()
  description?: JsonValue;

  @ApiProperty({
    description: 'Arayüzde gösterilecek özellikler (ikon, etiket vb.)',
    type: 'array',
    items: {
        type: 'object',
        properties: {
            icon: { type: 'string' },
            label: { type: 'string' },
            value: { type: 'string' },
        }
    },
    required: false,
    example: [
      { icon: 'mail', label: 'Yüksek Hızlı İnternet', value: '100 Mbps' },
      { icon: 'shield ', label: 'Sınırsız Kahve', value: 'Evet' }
    ],
  })
  @IsOptional()
  @IsArray()
  displayFeatures?: JsonValue;

  @ApiProperty({
    description: 'Planın kimler için uygun olduğunu belirten etiketler dizisi',
    type: 'array',
    items: { type: 'string' },
    required: false,
    example: ['Founders', 'Freelancers'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bestFor?: JsonValue;

  
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
    description: 'Serbest biçimli açıklama JSON’u (object veya array).',
    type: 'object',
    additionalProperties: true,
    example: { summary: 'Uygun fiyatlı başlangıç planı', details: { docs: true, forwarding: false } },
  })
  @IsOptional()
  @IsObject()
  description?: Record<string, unknown>;

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
    description: 'Serbest biçimli açıklama JSON’u (object veya array).',
    type: 'object',
    additionalProperties: true,
    example: { summary: 'Uygun fiyatlı başlangıç planı', details: { docs: true, forwarding: false } },
  })
  @IsOptional()
  @IsObject()
  description?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Sadece gösterim için kullanılacak özellikler (UI config).',
    type: 'object',
    additionalProperties: true,
    example: {
      badges: ['Best Value'],
      highlights: ['Aylık 20 tarama', '1 ücretsiz yönlendirme'],
      theme: { color: '#6B8AFB', icon: 'mail' },
    },
  })
  @IsOptional()
  @IsObject()
  displayFeatures?: Record<string, unknown>;
  
  @ApiPropertyOptional({
    description: 'Hedef kitle listesi (JSON’a string[] olarak yazılır).',
    type: [String],
    example: ['freelancers', 'startups', 'remote teams'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bestFor?: string[];
  
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

export class GetPlansQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isDeleted: boolean = false;

  @IsOptional()
  @IsUUID()
  officeLocationId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 10;
}
