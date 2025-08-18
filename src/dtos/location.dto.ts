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

// =====================
// OFFICE LOCATION DTOs
// =====================

export class CreateOfficeLocationDto {
  @ApiProperty({
    description: 'Location label',
    example: 'Soho - NYC',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Address line 1',
    example: '447 Broadway',
  })
  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Suite 200',
  })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State or Province',
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
    description: 'ZIP/Postal code',
    example: '10013',
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Location description',
    example: 'Premium office space in the heart of Soho',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 40.7205,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: -74.0031,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Is location active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1-555-0456',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'new@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Working hours',
    example: '8 AM - 6 PM',
  })
  @IsString()
  @IsOptional()
  workingHours?: string;

  @ApiPropertyOptional({
    description: 'Timezone',
    example: 'America/New_York',
  })
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateOfficeLocationDto extends PartialType(CreateOfficeLocationDto) {
  @ApiPropertyOptional({
    description: 'Is location deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class OfficeLocationResponseDto {
  @ApiProperty({
    description: 'Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Location label',
    example: 'Soho - NYC',
  })
  label: string;

  @ApiProperty({
    description: 'Address line 1',
    example: '447 Broadway',
  })
  addressLine: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Suite 200',
  })
  addressLine2?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  city: string;

  @ApiProperty({
    description: 'State or Province',
    example: 'NY',
  })
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
  })
  country: string;

  @ApiPropertyOptional({
    description: 'ZIP/Postal code',
    example: '10013',
  })
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Location description',
    example: 'Premium office space in the heart of Soho',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 40.7205,
  })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: -74.0031,
  })
  longitude?: number;

  @ApiProperty({
    description: 'Is location active',
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
    description: 'Plans available at this location',
    type: [Object],
  })
  plans?: any[];

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'office@location.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Working hours',
    example: '9 AM - 6 PM EST',
  })
  workingHours?: string;

  @ApiPropertyOptional({
    description: 'Timezone',
    example: 'America/New_York',
  })
  timezone?: string;

  @ApiProperty({
    description: 'Is location deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiPropertyOptional({
    description: 'Mailboxes at this location',
    type: [Object],
  })
  mailboxes?: any[];

  @ApiPropertyOptional({
    description: 'Available carriers at this location',
    type: [Object],
  })
  aviableCarriers?: any[];

  @ApiPropertyOptional({
    description: 'Delivery speed options at this location',
    type: [Object],
  })
  deliverySpeedOptions?: any[];

  @ApiPropertyOptional({
    description: 'Packaging type options at this location',
    type: [Object],
  })
  packagingTypeOptions?: any[];

  @ApiPropertyOptional({
    description: 'Forward requests from this location',
    type: [Object],
  })
  forwardRequest?: any[];
}

export class ActiveOfficeLocationResponseDto {
  @ApiProperty({
    description: 'Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Location label',
    example: 'Soho - NYC',
  })
  label: string;


  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  city: string;

  @ApiProperty({
    description: 'State or Province',
    example: 'NY',
  })
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
  })
  country: string;

  @ApiPropertyOptional({
    description: 'Location description',
    example: 'Premium office space in the heart of Soho',
  })
  description?: string;

  @ApiProperty({
    description: 'Is location active',
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
}

export class OfficeLocationQueryDto {

  @ApiPropertyOptional({
    description: 'Search by label, city, or state',
    example: 'NYC',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by country',
    example: 'United States',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter by state',
    example: 'NY',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'New York',
  })
  @IsString()
  @IsOptional()
  city?: string;

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



