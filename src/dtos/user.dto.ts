// Path: src/dtos/user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsDate,
  MinLength,
  IsStrongPassword,
  IsEmail,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';


export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class GetUserDetailDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string;
}

export class CheckEmailisExistDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  email: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User first name', example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User telephone number',
    example: '5374352423',
  })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({
    description: "URL to the user's profile image",
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the user wants to receive notifications',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates if the user account is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActivate?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({
    description: 'New password of the user',
    example: 'newpassword123',
  })
  @IsString()
  @IsStrongPassword()
  @MinLength(6)
  newPassword: string;
}

export class ChangeEmailDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({
    description: 'New email of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  newEmail: string;
}

export class SetActiveContextDto {
  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  mailboxId?: string;
}


export class ContextDto {
  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  mailboxId?: string;
}