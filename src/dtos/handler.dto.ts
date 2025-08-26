import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional, IsEmail, IsString } from 'class-validator';

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



// Register DTO
export class CreateHandlerDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John',
  })
  @IsString()
  firstName: string;


  @ApiProperty({
    description: 'The lastname of the user',
    example: 'Doe',
  })
  @IsString()
  lastName: string;


  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@example.com',
  })

  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The office location ID to assign the handler to',
    example: 'a0a8012e-aaaa-bbbb-cccc-444455556666',
  })
  @IsString()
  officeLocationId: string;

}

import { ActionStatus, MailActionType } from '@prisma/client';
import { IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListActionRequestsQueryDto {

  @IsOptional()
  @IsEnum(MailActionType)
  @ApiPropertyOptional({ enum: MailActionType, description: 'Tek tipe filtre (opsiyonel)' })
  type?: MailActionType;

  @IsOptional()
  @IsEnum(ActionStatus)
  @ApiPropertyOptional({ enum: ActionStatus, description: 'Aksiyon durum filtresi (opsiyonel)' })
  status?: ActionStatus;

}
