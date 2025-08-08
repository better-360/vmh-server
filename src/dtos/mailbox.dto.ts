import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
  IsDateString,
  IsInt,
} from 'class-validator';
import { BillingCycle, SubscriptionStatus } from '@prisma/client';

// =====================
// MAILBOX DTOs
// =====================

export class RecipientResponseDto {
  @ApiProperty({
    description: 'Recipient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Recipient name',
    example: 'John',
  })
  name: string;

  @ApiProperty({
    description: 'Recipient last name',
    example: 'Doe',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Recipient email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Recipient created at',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
  
}
export class CreateMailboxDto {
  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeLocationId: string;

  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Plan Price ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  planPriceId: string;

  @ApiProperty({
    description: 'Billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiPropertyOptional({
    description: 'Stripe subscription ID',
    example: 'sub_1234567890',
  })
  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;

  @ApiProperty({
    description: 'Start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Forwarding address limit',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  forwardingAddressLimit?: number;

  @ApiPropertyOptional({
    description: 'Recipient limit',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  recipientLimit?: number;
}

export class UpdateMailboxDto extends PartialType(CreateMailboxDto) {
  @ApiPropertyOptional({
    description: 'Mailbox status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Is mailbox active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class MailboxResponseDto {
  @ApiProperty({
    description: 'Mailbox ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Office Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  officeLocationId: string;

  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  planId: string;

  @ApiProperty({
    description: 'Plan Price ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  planPriceId: string;

  @ApiProperty({
    description: 'Billing cycle',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  @ApiPropertyOptional({
    description: 'Stripe subscription ID',
    example: 'sub_1234567890',
  })
  stripeSubscriptionId?: string;

  @ApiProperty({
    description: 'Mailbox status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Is mailbox active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiPropertyOptional({
    description: 'End date',
    example: '2024-12-31T23:59:59.999Z',
  })
  endDate?: Date;

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

  @ApiProperty({
    description: 'Forwarding address limit',
    example: 1,
  })
  forwardingAddressLimit: number;

  @ApiProperty({
    description: 'Recipient limit',
    example: 1,
  })
  recipientLimit: number;

  // Relations
  @ApiPropertyOptional({
    description: 'Workspace details',
  })
  workspace?: any;

  @ApiPropertyOptional({
    description: 'Office location details',
  })
  officeLocation?: any;

  @ApiPropertyOptional({
    description: 'Plan details',
  })
  plan?: any;

  @ApiPropertyOptional({
    description: 'Plan price details',
  })
  planPrice?: any;

  @ApiPropertyOptional({
    description: 'Delivery addresses',
    type: [Object],
  })
  deliveryAddresses?: any[];

  @ApiPropertyOptional({
    description: 'Feature usages',
    type: [Object],
  })
  featureUsages?: any[];

  @ApiPropertyOptional({
    description: 'Subscription items',
    type: [Object],
  })
  subscriptionItems?: any[];

  @ApiPropertyOptional({
    description: 'Mails',
    type: [Object],
  })
  mails?: any[];

  @ApiPropertyOptional({
    description: 'Recipients',
    type: [Object],
  })
  recipients?: RecipientResponseDto[];
}

