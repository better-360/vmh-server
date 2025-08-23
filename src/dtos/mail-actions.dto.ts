import { ActionStatus, MailActionType } from '@prisma/client';
import {
  IsUUID,
  IsOptional,
  IsInt,
  IsString,
  IsDateString,
  Min,
  IsEnum,
  IsObject,
  IsBoolean,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiExtraModels,
} from '@nestjs/swagger';

/**
 * Enums
 */

export enum SortField {
  requestedAt = 'requestedAt',
  updatedAt = 'updatedAt',
  type = 'type',
  status = 'status',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

/**
 * FORWARD specific input (initial request)
 */
export class CreateForwardRequestInput {
  @ApiProperty({
    description: 'The ID of the Mailbox (subscription) related to the action',
    example: '4c1c8e08-6d9e-4ea7-9b0c-4d6c5a5f4a11',
  })
  @IsUUID()
  mailboxId!: string;

  @ApiProperty({
    description: 'The office location where the package is stored',
    example: '9a0f2eb1-2f9b-4c82-8d51-1d9a3e9b3d77',
  })
  @IsUUID()
  officeLocationId!: string;

  @ApiProperty({
    description:
      'The delivery address where the user wants the package to be sent',
    example: 'a1b2c3d4-1111-2222-3333-444455556666',
  })
  @IsUUID()
  deliveryAddressId!: string;

  @ApiProperty({
    description: 'Selected delivery speed option',
    example: '11111111-2222-3333-4444-555555555555',
  })
  @IsUUID()
  deliverySpeedOptionId!: string;

  @ApiProperty({
    description: 'Selected packaging type option',
    example: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
  })
  @IsUUID()
  packagingTypeOptionId!: string;

  @ApiPropertyOptional({
    description: 'Carrier ID (optional, if the user chooses)',
    example: 'f0d8f6d5-3e76-4e8e-8f3a-7d2c7b2a9b12',
  })
  @IsOptional()
  @IsUUID()
  carrierId?: string;
}

/**
 * If type=FORWARD, CreateMailActionDto.meta.forward is expected
 */
@ApiExtraModels(CreateForwardRequestInput)
export class CreateForwardMetaDto {
  @ApiProperty({
    description: 'Forward request details',
    type: () => CreateForwardRequestInput,
  })
  forward!: CreateForwardRequestInput;
}

/**
 * Create Mail Action DTO
 */
export class CreateMailActionDto {
  @ApiProperty({
    description: 'The Mail (package) ID related to the action',
    example: '0b2e9d9b-9e32-4c8c-a2d9-3f7e2e3b5c1a',
  })
  @IsUUID()
  @IsOptional()
  mailId: string;

  @ApiProperty({
    description: 'Type of action',
    enum: MailActionType,
    example: MailActionType.FORWARD,
  })
  @IsEnum(MailActionType)
  type!: MailActionType;

  @ApiPropertyOptional({
    description:
      'Additional details (FORWARD requires { forward: CreateForwardRequestInput })',
    example: {
      forward: {
        mailboxId: '4c1c8e08-6d9e-4ea7-9b0c-4d6c5a5f4a11',
        officeLocationId: '9a0f2eb1-2f9b-4c82-8d51-1d9a3e9b3d77',
        deliveryAddressId: 'a1b2c3d4-1111-2222-3333-444455556666',
        deliverySpeedOptionId: '11111111-2222-3333-4444-555555555555',
        packagingTypeOptionId: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
        carrierId: 'f0d8f6d5-3e76-4e8e-8f3a-7d2c7b2a9b12',
      },
    },
  })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  @ApiPropertyOptional({
    description:
      'Quickly mark the mail as shredded when SHRED action is completed',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  markShredded?: boolean;

  @ApiPropertyOptional({
    description: 'Mark the mail as JUNK',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  markJunk?: boolean;

  @ApiPropertyOptional({
    description: 'Mark the mail as HOLD',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  markHold?: boolean;

  @ApiPropertyOptional({
    description: 'Mark the mail as SCANNED',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  markScanned?: boolean;
}

/**
 * Update Action Status DTO
 */
export class UpdateActionStatusDto {
  @ApiProperty({
    description: 'New action status',
    enum: ActionStatus,
    example: ActionStatus.IN_PROGRESS,
  })
  @IsEnum(ActionStatus)
  status!: ActionStatus;

  @ApiPropertyOptional({
    description: 'Reason or error message (e.g., FAILED)',
    example: 'Address could not be verified',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Complete Forward DTO
 */
export class CompleteForwardDto {
  @ApiPropertyOptional({
    description: 'Carrier ID',
    example: 'f0d8f6d5-3e76-4e8e-8f3a-7d2c7b2a9b12',
  })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({
    description: 'Carrier tracking code',
    example: 'UPS1Z999AA101234567',
  })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiPropertyOptional({
    description: 'Shipping cost (in cents)',
    example: 1299,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional({
    description: 'Packaging cost (in cents)',
    example: 300,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  packagingCost?: number;

  @ApiPropertyOptional({
    description:
      'Total cost (in cents). If omitted, the service will calculate as shippingCost + packagingCost',
    example: 1599,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalCost?: number;
}

/**
 * Cancel Forward DTO
 */
export class CancelForwardDto {
  @ApiProperty({
    description: 'Cancellation reason',
    example: 'Cancelled by user request',
  })
  @IsString()
  reason!: string;
}

/**
 * Query Mail Actions DTO (for admin panel listing)
 */
export class QueryMailActionsDto {
  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: MailActionType,
  })
  @IsOptional()
  @IsEnum(MailActionType)
  type?: MailActionType;

  @ApiPropertyOptional({
    description: 'Filter by action status',
    enum: ActionStatus,
  })
  @IsOptional()
  @IsEnum(ActionStatus)
  status?: ActionStatus;

  @ApiPropertyOptional({
    description: 'Filter by Mailbox (subscription) ID',
    example: '4c1c8e08-6d9e-4ea7-9b0c-4d6c5a5f4a11',
  })
  @IsOptional()
  @IsUUID()
  mailboxId?: string;

  @ApiPropertyOptional({
    description:
      'Filter by office location ID (join via: mail.mailbox.officeLocationId)',
    example: '9a0f2eb1-2f9b-4c82-8d51-1d9a3e9b3d77',
  })
  @IsOptional()
  @IsUUID()
  officeLocationId?: string;

  @ApiPropertyOptional({
    description: 'Search text (STE number, tracking code, sender name, etc.)',
    example: 'STE-102938 / UPS / Acme Corp',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Start date (ISO 8601)',
    example: '2025-08-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601)',
    example: '2025-08-10T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: SortField,
    example: SortField.requestedAt,
  })
  @IsOptional()
  @IsEnum(SortField)
  sort?: SortField;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.desc,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}

export class ForwarMeta {
  @IsString()
  mailboxId: string;
  @IsString()
  officeLocationId: string;
  @IsString()
  deliveryAddressId: string;
  @IsString()
  deliverySpeedOptionId: string;
  @IsString()
  packagingTypeOptionId: string;
  @IsString()
  @IsOptional()
  carrierId: string;
}


export class CreateMailActionRequestDto {
  @ApiProperty({
    description: 'The Mail (package) ID related to the action',
    example: '0b2e9d9b-9e32-4c8c-a2d9-3f7e2e3b5c1a',
  })
  @IsUUID()
  @IsOptional()
  mailId: string;

  @ApiProperty({
    description: 'Type of action',
    enum: MailActionType,
    example: MailActionType.SHRED,
  })
  @IsEnum(MailActionType)
  type!: MailActionType;

}
