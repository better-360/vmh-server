import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class AssignHandlerDto {
  @ApiProperty({ description: 'User ID to assign', example: 'c0a8012e-1111-2222-3333-444455556666' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Office location ID', example: 'a0a8012e-aaaa-bbbb-cccc-444455556666' })
  @IsUUID()
  officeLocationId: string;
}

export class HandlerAssignmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  officeLocationId: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ToggleHandlerDto {
  @ApiPropertyOptional({ description: 'Set active flag' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


