import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { ResetCycle } from '@prisma/client';
import { PriceResponseDto } from './items.dto';

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
      description: 'Product ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    productId: string;
  
    @ApiProperty({
      description: 'Product Price ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    productPriceId: string;
  
    @ApiProperty({
      description: 'Display order in plan addons list',
      example: 1,
    })
    @IsInt()
    displayOrder: number;
  
    @ApiPropertyOptional({
      description: 'Is addon active',
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
      description: 'Product ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    })
    productId: string;
  
    @ApiProperty({
      description: 'Product Price ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    })
    productPriceId: string;
  
    @ApiProperty({
      description: 'Display order',
      example: 1,
    })
    displayOrder: number;
  
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
      description: 'Product details',
    })
    product?: any;
  
    @ApiPropertyOptional({
      description: 'Price details',
    })
    prices?: PriceResponseDto[];
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
      description: 'Included limit (null = unlimited, 0 = not included but can be purchased)',
      example: 10,
      minimum: 0,
    })
    @IsInt()
    @Min(0)
    @IsOptional()
    includedLimit?: number;
  
    @ApiPropertyOptional({
      description: 'Unit price in cents for extra usage (null = not available for purchase)',
      example: 299,
      minimum: 0,
    })
    @IsInt()
    @Min(0)
    @IsOptional()
    unitPrice?: number;
  
    @ApiProperty({
      description: 'Reset cycle for the feature',
      enum: ResetCycle,
      example: ResetCycle.MONTHLY,
      default: ResetCycle.MONTHLY,
    })
    @IsEnum(ResetCycle)
    @IsOptional()
    resetCycle?: ResetCycle;
  
    @ApiPropertyOptional({
      description: 'Is feature active in this plan',
      example: true,
      default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  
    @ApiPropertyOptional({
      description: 'Display order in plan features list',
      example: 1,
    })
    @IsInt()
    @IsOptional()
    displayOrder?: number;
  
    @ApiPropertyOptional({
      description: 'Show this feature in marketplace list',
      example: true,
      default: true,
    })
    @IsBoolean()
    @IsOptional()
    showOnList?: boolean;
  }
  
  export class UpdatePlanFeatureDto extends PartialType(CreatePlanFeatureDto) {
    @ApiPropertyOptional({
      description: 'Is plan feature deleted',
      example: false,
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
      description: 'Included limit',
      example: 10,
    })
    includedLimit?: number;
  
    @ApiPropertyOptional({
      description: 'Unit price in cents',
      example: 299,
    })
    unitPrice?: number;
  
    @ApiProperty({
      description: 'Reset cycle',
      enum: ResetCycle,
      example: ResetCycle.MONTHLY,
    })
    resetCycle: ResetCycle;
    
    @ApiProperty({
      description: 'Is feature active',
      example: true,
    })
    isActive: boolean;
  
    @ApiPropertyOptional({
      description: 'Display order',
      example: 1,
    })
    displayOrder?: number;
  
    @ApiProperty({
      description: 'Show on list',
      example: true,
    })
    showOnList: boolean;
  
    @ApiProperty({
      description: 'Is feature deleted',
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
      description: 'Feature details',
    })
    feature?: any;
  }
  