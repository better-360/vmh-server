import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsEmail,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

// =====================
// WORKSPACE DTOs
// =====================

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'Workspace name',
    example: 'My Company',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Is workspace active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {
  @ApiPropertyOptional({
    description: 'Is workspace deleted',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class WorkspaceResponseDto {
  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Workspace name',
    example: 'My Company',
  })
  name: string;

  @ApiProperty({
    description: 'Is workspace active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Is workspace deleted',
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
    description: 'Workspace members',
    type: [Object],
  })
  members?: any[];

  @ApiPropertyOptional({
    description: 'Workspace tickets',
    type: [Object],
  })
  tickets?: any[];

  @ApiPropertyOptional({
    description: 'Workspace invoices',
    type: [Object],
  })
  invoices?: any[];

  @ApiPropertyOptional({
    description: 'Workspace invitations',
    type: [Object],
  })
  invitations?: any[];

  @ApiPropertyOptional({
    description: 'Workspace mailboxes',
    type: [Object],
  })
  mailboxes?: any[];

  @ApiPropertyOptional({
    description: 'Workspace balance',
  })
  balance?: any;
}

// =====================
// WORKSPACE MEMBER DTOs
// =====================

export class CreateWorkspaceMemberDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({
    description: 'Member role',
    enum: WorkspaceRole,
    example: WorkspaceRole.MEMBER,
  })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;

  @ApiPropertyOptional({
    description: 'Is default workspace for user',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateWorkspaceMemberDto extends PartialType(CreateWorkspaceMemberDto) {
  @ApiPropertyOptional({
    description: 'Is member deleted',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class WorkspaceMemberResponseDto {
  @ApiProperty({
    description: 'Member ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Member role',
    enum: WorkspaceRole,
    example: WorkspaceRole.MEMBER,
  })
  role: WorkspaceRole;

  @ApiProperty({
    description: 'Is default workspace',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Is member deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Joined at',
    example: '2024-01-01T00:00:00.000Z',
  })
  joinedAt: Date;

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
    description: 'User details',
  })
  user?: any;

  @ApiPropertyOptional({
    description: 'Workspace details',
  })
  workspace?: any;
}

// =====================
// WORKSPACE BALANCE DTOs
// =====================

export class WorkspaceBalanceResponseDto {
  @ApiProperty({
    description: 'Balance ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Stripe customer ID',
    example: 'cus_1234567890',
  })
  stripeCustomerId: string;

  @ApiProperty({
    description: 'Current debt in cents',
    example: 0,
  })
  currentDebt: number;

  @ApiProperty({
    description: 'Current balance in cents',
    example: 10000,
  })
  currentBalance: number;

  @ApiProperty({
    description: 'Is account restricted',
    example: false,
  })
  isRestricted: boolean;

  @ApiPropertyOptional({
    description: 'Last charged at',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastChargedAt?: Date;

  @ApiProperty({
    description: 'Is balance active',
    example: true,
  })
  isActive: boolean;

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

  // Relations
  @ApiPropertyOptional({
    description: 'Workspace details',
  })
  workspace?: any;

  @ApiPropertyOptional({
    description: 'Balance transactions',
    type: [Object],
  })
  transactions?: any[];

  @ApiPropertyOptional({
    description: 'Balance reminders',
    type: [Object],
  })
  reminders?: any[];
}

// =====================
// WORKSPACE INVITE DTOs  
// =====================

export class InviteToWorkspaceDto {
  @ApiProperty({
    description: 'Email address to invite',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role to assign',
    enum: WorkspaceRole,
    example: WorkspaceRole.MEMBER,
  })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}