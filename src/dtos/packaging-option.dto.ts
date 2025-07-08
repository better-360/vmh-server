import { IsString, IsOptional, IsBoolean, IsUUID, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackagingOptionDto {
  @ApiProperty({ description: 'Unique label for the packaging option', example: 'STANDARD_BOX' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Display title of the packaging option', example: 'Standard Box' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the packaging option', example: 'A standard cardboard box', })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePackagingOptionDto {
  @ApiPropertyOptional({ description: 'Unique label for the packaging option', example: 'STANDARD_BOX' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Display title of the packaging option', example: 'Standard Box' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description of the packaging option', example: 'A standard cardboard box', })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Active flag to soft delete or restore', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignPackagingOptionToLocationDto {
  @ApiProperty({ description: 'ID of the packaging type to assign', example: 'uuid-of-packaging-type' })
  @IsUUID()
  packagingTypeId: string;

  @ApiProperty({ description: 'ID of the office location', example: 'uuid-of-office-location' })
  @IsUUID()
  officeLocationId: string;

  @ApiPropertyOptional({ description: 'Price override in cents for this location', example: 500 })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiPropertyOptional({ description: 'Active flag for this assignment', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
