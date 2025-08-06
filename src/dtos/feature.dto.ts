import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

// =====================
// FEATURE DTOs
// =====================

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'Mail Forwarding',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Feature description',
    example: 'Forward your mail to any address worldwide',
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
    example: 'Mail Forwarding',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Feature description',
    example: 'Forward your mail to any address worldwide',
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
    description: 'Plan features using this feature',
    type: [Object],
  })
  planFeatures?: any[];

  @ApiPropertyOptional({
    description: 'Plan template features using this feature',
    type: [Object],
  })
  planTemplateFeatures?: any[];

  @ApiPropertyOptional({
    description: 'Feature usages',
    type: [Object],
  })
  usages?: any[];

  @ApiPropertyOptional({
    description: 'Product features using this feature',
    type: [Object],
  })
  productFeature?: any[];
}