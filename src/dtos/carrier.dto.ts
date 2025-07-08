import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsUUID, IsInt } from 'class-validator';

export class CreateCarrierDto {
 @ApiProperty({ description: 'Carrier Name', example: 'UPS Cargo' })
  @IsString()
  name: string;

@ApiPropertyOptional({ description: 'Description of Cargo', example: 'Example' })
  @IsString()
 @IsOptional()
  description?: string;

@ApiPropertyOptional({ description: 'Logo link of Cargo', example: 'http://linl.com/example.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}


export class UpdateCarrierDto extends PartialType(CreateCarrierDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Active this carrier or not', example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}