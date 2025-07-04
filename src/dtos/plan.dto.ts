import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  WEEKLY = 'WEEKLY',
  QUARTERLY = 'QUARTERLY',
}

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

export class PlanResponseDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Plan name',
    example: 'Basic Plan',
  })
  name: string;

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
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  officeLocationId: string;

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
    description: 'Plan features',
    type: [Object],
  })
  features?: any[];

  @ApiPropertyOptional({
    description: 'Plan prices',
    type: [Object],
  })
  prices?: any[];
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
    example: BillingCycle.YEARLY,
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({
    description: 'Price amount in cents (e.g., 9999 = $99.99)',
    example: 9999,
    minimum: 0,
  })
  @IsNumber()
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
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class PlanPriceResponseDto {
  @ApiProperty({
    description: 'Price ID',
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
    example: 9999,
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
}

// =====================
// FEATURE DTOs
// =====================

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'Virtual Address',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Feature description',
    example: 'Access to virtual business address services',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Feature image URL',
    example: 'https://example.com/feature-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Is feature active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {
    @ApiPropertyOptional({
    description: 'Is feature deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class FeatureResponseDto {
  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Feature name',
    example: 'Virtual Address',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Feature description',
    example: 'Access to virtual business address services',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Feature image URL',
    example: 'https://example.com/feature-image.png',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Is feature active',
    example: true,
  })
  isActive: boolean;

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
    description: 'Is feature deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

// =====================
// PLAN FEATURE DTOs
// =====================

export class CreatePlanFeatureDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  featureId: string;

  @ApiPropertyOptional({
    description: 'Included limit (null = unlimited, 0 = not included but available for purchase)',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  includedLimit?: number;

  @ApiPropertyOptional({
    description: 'Unit price in cents (null = not available for purchase)',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;


  @ApiPropertyOptional({
    description: 'Is plan feature active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePlanFeatureDto extends PartialType(CreatePlanFeatureDto) {
  @ApiPropertyOptional({
    description: 'Is plan feature deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class PlanFeatureResponseDto {
  @ApiProperty({
    description: 'Plan feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  planId: string;

  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  featureId: string;

  @ApiPropertyOptional({
    description: 'Included limit (null = unlimited)',
    example: 5,
  })
  includedLimit?: number;

  @ApiPropertyOptional({
    description: 'Unit price in cents (null = not available)',
    example: 500,
  })
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Plan details',
    type: PlanResponseDto,
  })
  plan?: PlanResponseDto;

  @ApiPropertyOptional({
    description: 'Feature details',
    type: FeatureResponseDto,
  })
  feature?: FeatureResponseDto;
  
  @ApiProperty({
    description: 'Is plan feature active',
    example: true,
  })
  isActive: boolean;

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
    description: 'Is plan feature deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

// =====================
// SUBSCRIPTION DTOs (Office Location Based)
// =====================

export class CreateOfficeSubscriptionDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeLocationId: string;

  @ApiProperty({
    description: 'Plan Price ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiPropertyOptional({
    description: 'Stripe subscription ID',
    example: 'sub_1234567890',
  })
  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Subscription end date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

export class UpdateOfficeSubscriptionDto extends PartialType(CreateOfficeSubscriptionDto) {
  @ApiPropertyOptional({
    description: 'Is subscription active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class OfficeSubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  officeLocationId: string;

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

  @ApiPropertyOptional({
    description: 'Stripe subscription ID',
    example: 'sub_1234567890',
  })
  stripeSubscriptionId?: string;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Subscription end date',
    example: '2024-12-31T23:59:59.999Z',
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Is subscription active',
    example: true,
  })
  isActive: boolean;

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
    description: 'Plan details',
    type: PlanPriceResponseDto,
  })
  plan?: PlanPriceResponseDto;

  @ApiPropertyOptional({
    description: 'User details',
    type: Object,
  })
  user?: any;

  @ApiPropertyOptional({
    description: 'Office location details',
    type: Object,
  })
  officeLocation?: any;
}

export class OfficeSubscriptionQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  officeLocationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Filter by billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

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
// WORKSPACE SUBSCRIPTION DTOs
// =====================

export class CreateWorkspaceSubscriptionDto {
  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeLocationId: string;

  @ApiProperty({
    description: 'Plan Price ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiPropertyOptional({
    description: 'Stripe subscription ID',
    example: 'sub_1234567890',
  })
  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Subscription end date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

export class UpdateWorkspaceSubscriptionDto extends PartialType(CreateWorkspaceSubscriptionDto) {
  @ApiPropertyOptional({
    description: 'Is subscription active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class WorkspaceSubscriptionQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  workspaceId?: string;

  @ApiPropertyOptional({
    description: 'Filter by office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  officeLocationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Filter by billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

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
// FEATURE USAGE DTOs (Office Location Based)
// =====================

export class CreateFeatureUsageDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeLocationId: string;

  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  featureId: string;

  @ApiProperty({
    description: 'Usage month (first day of month)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  usedAt: Date;

  @ApiProperty({
    description: 'Usage count',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  usedCount: number;
}

export class UpdateFeatureUsageDto {
  @ApiProperty({
    description: 'Usage count',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  usedCount: number;
}

export class FeatureUsageResponseDto {
  @ApiProperty({
    description: 'Feature usage ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  officeLocationId: string;

  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  featureId: string;

  @ApiProperty({
    description: 'Usage month',
    example: '2024-01-01T00:00:00.000Z',
  })
  usedAt: Date;

  @ApiProperty({
    description: 'Usage count',
    example: 5,
  })
  usedCount: number;

  @ApiPropertyOptional({
    description: 'User details',
    type: Object,
  })
  user?: any;

  @ApiPropertyOptional({
    description: 'Office location details',
    type: Object,
  })
  officeLocation?: any;

  @ApiPropertyOptional({
    description: 'Feature details',
    type: FeatureResponseDto,
  })
  feature?: FeatureResponseDto;
}

export class FeatureUsageQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  officeLocationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  featureId?: string;

  @ApiPropertyOptional({
    description: 'Filter by month',
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  usedAt?: Date;

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
// QUERY DTOs
// =====================

export class PlanQueryDto {
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
    description: 'Search by name',
    example: 'Basic',
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

export class PlanPriceQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Filter by billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({
    description: 'Filter by currency',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}

export class FeatureQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Virtual',
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

export class PlanFeatureQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Filter by feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  featureId?: string;
}

// =====================
// BULK OPERATION DTOs
// =====================

export class BulkCreatePlanFeaturesDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Array of plan features to create',
    type: [CreatePlanFeatureDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanFeatureDto)
  features: Omit<CreatePlanFeatureDto, 'planId'>[];
}

export class BulkUpdatePlanFeaturesDto {
  @ApiProperty({
    description: 'Array of plan feature updates',
    type: [Object],
  })
  @IsArray()
  @ValidateNested({ each: true })
  features: Array<{
    id: string;
    includedLimit?: number;
    unitPrice?: number;
  }>;
}

// =====================
// WORKSPACE FEATURE USAGE DTOs (Workspace Based)
// =====================

export class CreateWorkspaceFeatureUsageDto {
  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeLocationId: string;

  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  featureId: string;

  @ApiProperty({
    description: 'Usage month (first day of month)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  usedAt: Date;

  @ApiProperty({
    description: 'Usage count',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  usedCount: number;
}

export class UpdateWorkspaceFeatureUsageDto {
  @ApiProperty({
    description: 'Usage count',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  usedCount: number;
}

export class WorkspaceFeatureUsageResponseDto {
  @ApiProperty({
    description: 'Feature usage ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  officeLocationId: string;

  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  featureId: string;

  @ApiProperty({
    description: 'Usage month',
    example: '2024-01-01T00:00:00.000Z',
  })
  usedAt: Date;

  @ApiProperty({
    description: 'Usage count',
    example: 5,
  })
  usedCount: number;

  @ApiPropertyOptional({
    description: 'Workspace details',
    type: Object,
  })
  workspace?: any;

  @ApiPropertyOptional({
    description: 'Office location details',
    type: Object,
  })
  officeLocation?: any;

  @ApiPropertyOptional({
    description: 'Feature details',
    type: FeatureResponseDto,
  })
  feature?: FeatureResponseDto;
}

export class WorkspaceFeatureUsageQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  workspaceId?: string;

  @ApiPropertyOptional({
    description: 'Filter by office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  officeLocationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  featureId?: string;

  @ApiPropertyOptional({
    description: 'Filter by month',
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  usedAt?: Date;

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
// PLAN TEMPLATE DTOs
// =====================

export class CreatePlanTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Basic Package Template',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Template slug',
    example: 'basic-package',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'Template description',
    example: 'Basic package template for small businesses',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Template image URL',
    example: 'https://example.com/template-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Monthly price in cents',
    example: 1999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  priceMonthly: number;

  @ApiProperty({
    description: 'Yearly price in cents',
    example: 19999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  priceYearly: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Template features',
    type: [Object],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanTemplateFeatureDto)
  @IsOptional()
  features?: CreatePlanTemplateFeatureDto[];
}

export class UpdatePlanTemplateDto {
  @ApiPropertyOptional({
    description: 'Template name',
    example: 'Basic Package Template',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Template slug',
    example: 'basic-package',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Template description',
    example: 'Basic package template for small businesses',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Template image URL',
    example: 'https://example.com/template-image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Monthly price in cents',
    example: 1999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMonthly?: number;

  @ApiPropertyOptional({
    description: 'Yearly price in cents',
    example: 19999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceYearly?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Is template active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Is template deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class PlanTemplateResponseDto {
  @ApiProperty({
    description: 'Template ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Template name',
    example: 'Basic Package Template',
  })
  name: string;

  @ApiProperty({
    description: 'Template slug',
    example: 'basic-package',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Template description',
    example: 'Basic package template for small businesses',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Template image URL',
    example: 'https://example.com/template-image.png',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Monthly price in cents',
    example: 1999,
  })
  priceMonthly: number;

  @ApiProperty({
    description: 'Yearly price in cents',
    example: 19999,
  })
  priceYearly: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Is template active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Is template deleted',
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
    description: 'Template features',
    type: [Object],
  })
  features?: any[];
}

export class CreatePlanTemplateFeatureDto {
  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  featureId: string;

  @ApiPropertyOptional({
    description: 'Included limit (null = unlimited, 0 = not included)',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  includedLimit?: number;

  @ApiPropertyOptional({
    description: 'Unit price in cents (null = not available for purchase)',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Is feature required in template',
    example: true,
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
}

export class UpdatePlanTemplateFeatureDto extends PartialType(CreatePlanTemplateFeatureDto) {}

export class PlanTemplateQueryDto {
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
    description: 'Search by name or slug',
    example: 'basic',
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

export class CreatePlanFromTemplateDto {
  @ApiProperty({
    description: 'Template ID to copy from',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeLocationId: string;

  @ApiPropertyOptional({
    description: 'Override plan name (optional)',
    example: 'NYC Basic Plan',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Override plan slug (optional)',
    example: 'nyc-basic',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Override monthly price (optional)',
    example: 2499,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMonthly?: number;

  @ApiPropertyOptional({
    description: 'Override yearly price (optional)',
    example: 24999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceYearly?: number;

  @ApiPropertyOptional({
    description: 'Override currency (optional)',
    example: 'EUR',
  })
  @IsString()
  @IsOptional()
  currency?: string;
}

