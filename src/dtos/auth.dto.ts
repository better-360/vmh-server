import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsStrongPassword, IsOptional } from 'class-validator';

// Register DTO
export class RegisterDto {
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
    description: 'The password of the user, at least 6 characters long',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The FCM ID for push notifications',
    example: 'fcm_id_example_123',
  })

  @IsString()
  @IsOptional()
  fcmId: string;

}

// Login DTO
export class LoginDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user, at least 6 characters long',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The FCM ID for push notifications',
    example: 'fcm_id_example_123',
  })
  @IsString()
  @IsOptional()
  fcmId: string;
}

// Change Password DTO
export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'currentPassword123',
  })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({
    description: 'The new password of the user, must be strong (contains upper and lowercase letters, numbers, and symbols)',
    example: 'NewPassword!123',
  })
  @IsString()
  @IsStrongPassword()
  @MinLength(6)
  newPassword: string;
}

export class GoogleSignInDto {
  @ApiProperty({
    description: 'Google ID token received from the client',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjhlNmE...',
  })
  @IsString()
  idToken: string;
}

export class TokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  refreshToken: string;
}


export class UserTokensDto{
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  refreshToken: string;
}
export class ResetPasswordDto {
  @ApiProperty({
    description: 'The email of the user',
    example: '',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The new password of the user, at least 6 characters long',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class VerifyResetTokenDto {
  @ApiProperty({
    description: 'The reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'User Mail',
    example: 'example@mail.com',
  })
  @IsEmail()
  email: string;
  
}