import { IsString, IsOptional, IsBoolean, IsUUID, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShippingSpeedDto {
  @ApiProperty({ description: 'Unique label for the shipping speed option', example: 'STANDARD' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Display title for the shipping speed option', example: 'Standard Delivery' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Optional description for the shipping speed option', example: 'Delivered within 5-7 business days' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Default base price in cents for this shipping speed', example: 500 })
  @IsInt()
  price: number;
}

export class UpdateShippingSpeedDto {
  @ApiPropertyOptional({ description: 'Unique label for the shipping speed option', example: 'STANDARD' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Display title for the shipping speed option', example: 'Standard Delivery' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Optional description for the shipping speed option', example: 'Delivered within 5-7 business days' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Default base price in cents for this shipping speed', example: 500 })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiPropertyOptional({ description: 'Active flag to soft delete or restore the option', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignShippingSpeedToLocationDto {
  @ApiProperty({ description: 'ID of the shipping speed option to assign', example: 'uuid-of-speed-option' })
  @IsUUID()
  deliverySpeedId: string;

  @ApiProperty({ description: 'ID of the office location', example: 'uuid-of-office-location' })
  @IsUUID()
  officeLocationId: string;

  @ApiPropertyOptional({ description: 'Price override in cents for this speed at this location', example: 700 })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiPropertyOptional({ description: 'Active flag for this assignment', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
