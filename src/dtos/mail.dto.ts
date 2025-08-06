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
  IsDateString
} from 'class-validator';

// =====================
// ENUMS
// =====================

export enum MailType {
  BANK_CHECK = 'BANK_CHECK',
  LEGAL_DOCUMENT = 'LEGAL_DOCUMENT',
  ENVELOPE = 'ENVELOPE',
  PACKAGE = 'PACKAGE',
  OTHER = 'OTHER',
}

export enum PackageStatus {
  PENDING = 'PENDING',
  FORWARDED = 'FORWARDED',
  SHREDDED = 'SHREDDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  IN_PROCESS = 'IN_PROCESS',
}

// =====================
// PACKAGE ITEM DTOs
// =====================

export class CreatePackageItemDto {
  @ApiProperty({
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Legal Document',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Important legal document from law firm',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Quantity of items',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 0.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 21.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 29.7,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 0.1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  length?: number;

  @ApiPropertyOptional({
    description: 'Volume in desi',
    example: 0.1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  volumeDesi?: number;

  @ApiPropertyOptional({
    description: 'Photo URLs',
    example: ['https://s3.amazonaws.com/bucket/photo1.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];

  @ApiPropertyOptional({
    description: 'Is item shredded',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isShereded?: boolean;

  @ApiPropertyOptional({
    description: 'Is item forwarded',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isForwarded?: boolean;
}

export class CreatePackageItemForPackageDto {
  @ApiProperty({
    description: 'Item name',
    example: 'Legal Document',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Important legal document from law firm',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Quantity of items',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 0.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 21.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 29.7,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 0.1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  length?: number;

  @ApiPropertyOptional({
    description: 'Volume in desi',
    example: 0.1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  volumeDesi?: number;

  @ApiPropertyOptional({
    description: 'Photo URLs',
    example: ['https://s3.amazonaws.com/bucket/photo1.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];

  @ApiPropertyOptional({
    description: 'Is item shredded',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isShereded?: boolean;

  @ApiPropertyOptional({
    description: 'Is item forwarded',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isForwarded?: boolean;
}

export class UpdatePackageItemDto extends PartialType(CreatePackageItemDto) {
  @ApiPropertyOptional({
    description: 'Is item deleted',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

export class PackageItemResponseDto {
  @ApiProperty({
    description: 'Item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  packageId: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Legal Document',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Important legal document from law firm',
  })
  description?: string;

  @ApiProperty({
    description: 'Quantity of items',
    example: 1,
  })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 0.5,
  })
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 21.0,
  })
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 29.7,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 0.1,
  })
  length?: number;

  @ApiPropertyOptional({
    description: 'Volume in desi',
    example: 0.1,
  })
  volumeDesi?: number;

  @ApiPropertyOptional({
    description: 'Photo URLs',
    example: ['https://s3.amazonaws.com/bucket/photo1.jpg'],
    type: [String],
  })
  photoUrls?: string[];

  @ApiProperty({
    description: 'Is item shredded',
    example: false,
  })
  isShereded: boolean;

  @ApiProperty({
    description: 'Is item forwarded',
    example: false,
  })
  isForwarded: boolean;

  @ApiProperty({
    description: 'Is item deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Deletion date',
    example: '2024-01-01T00:00:00.000Z',
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: 'Package details',
    type: Object,
  })
  package?: any;
}

// =====================
// PACKAGE DTOs
// =====================

export class CreatePackageDto {
  @ApiProperty({
    description: 'STE number on the package',
    example: '004712',
  })
  @IsString()
  @IsNotEmpty()
  steNumber: string;

  @ApiProperty({
    description: 'Mailbox ID (subscription ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  subscriptionId: string;

  // officeLocationId not needed - determined from mailbox relation

  @ApiProperty({
    description: 'Package type',
    enum: MailType,
    example: MailType.PACKAGE,
  })
  @IsEnum(MailType)
  type: MailType;

  @ApiProperty({
    description: 'Date when package was received',
    example: '2024-01-01T10:00:00.000Z',
  })
  @IsDateString()
  receivedAt: Date;

  @ApiPropertyOptional({
    description: 'Sender name',
    example: 'John Doe Company',
  })
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiPropertyOptional({
    description: 'Sender address',
    example: '123 Main St, New York, NY 10001',
  })
  @IsString()
  @IsOptional()
  senderAddress?: string;

  @ApiPropertyOptional({
    description: 'Carrier company',
    example: 'UPS',
  })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 30.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 20.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 15.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  length?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 2.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Volume in desi',
    example: 9.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  volumeDesi?: number;

  @ApiPropertyOptional({
    description: 'Photo URLs',
    example: ['https://s3.amazonaws.com/bucket/package1.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];

  @ApiPropertyOptional({
    description: 'Package status',
    enum: PackageStatus,
    example: PackageStatus.PENDING,
    default: PackageStatus.PENDING,
  })
  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus;

  @ApiPropertyOptional({
    description: 'Is package shredded',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isShereded?: boolean;

  @ApiPropertyOptional({
    description: 'Is package forwarded',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isForwarded?: boolean;
}

export class UpdatePackageDto extends PartialType(CreatePackageDto) {}

export class PackageResponseDto {
  @ApiProperty({
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'STE number on the package',
    example: '004712',
  })
  steNumber: string;

  @ApiProperty({
    description: 'Workspace address ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  workspaceAddressId: string;

  @ApiProperty({
    description: 'Office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  officeLocationId: string;

  @ApiProperty({
    description: 'Package type',
    enum: MailType,
    example: MailType.PACKAGE,
  })
  type: MailType;

  @ApiProperty({
    description: 'Date when package was received',
    example: '2024-01-01T10:00:00.000Z',
  })
  receivedAt: Date;

  @ApiPropertyOptional({
    description: 'Sender name',
    example: 'John Doe Company',
  })
  senderName?: string;

  @ApiPropertyOptional({
    description: 'Sender address',
    example: '123 Main St, New York, NY 10001',
  })
  senderAddress?: string;

  @ApiPropertyOptional({
    description: 'Carrier company',
    example: 'UPS',
  })
  carrier?: string;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 30.0,
  })
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 20.0,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 15.0,
  })
  length?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 2.5,
  })
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Volume in desi',
    example: 9.0,
  })
  volumeDesi?: number;

  @ApiPropertyOptional({
    description: 'Photo URLs',
    example: ['https://s3.amazonaws.com/bucket/package1.jpg'],
    type: [String],
  })
  photoUrls?: string[];

  @ApiProperty({
    description: 'Package status',
    enum: PackageStatus,
    example: PackageStatus.PENDING,
  })
  status: PackageStatus;

  @ApiProperty({
    description: 'Is package shredded',
    example: false,
  })
  isShereded: boolean;

  @ApiProperty({
    description: 'Is package forwarded',
    example: false,
  })
  isForwarded: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Package items',
    type: [PackageItemResponseDto],
  })
  items?: PackageItemResponseDto[];

  @ApiPropertyOptional({
    description: 'Workspace address details',
    type: Object,
  })
  workspaceAddress?: any;

  @ApiPropertyOptional({
    description: 'Office location details',
    type: Object,
  })
  officeLocation?: any;

  @ApiPropertyOptional({
    description: 'Package actions',
    type: [Object],
  })
  actions?: any[];

  @ApiPropertyOptional({
    description: 'Forward requests',
    type: [Object],
  })
  forwardRequests?: any[];
}

// =====================
// QUERY DTOs
// =====================

export class PackageQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by mailbox ID (subscription ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  subscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by workspace ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  workspaceId?: string;

  @ApiPropertyOptional({
    description: 'Filter by office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  officeLocationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by package type',
    enum: MailType,
    example: MailType.PACKAGE,
  })
  @IsEnum(MailType)
  @IsOptional()
  type?: MailType;

  @ApiPropertyOptional({
    description: 'Filter by package status',
    enum: PackageStatus,
    example: PackageStatus.PENDING,
  })
  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus;

  @ApiPropertyOptional({
    description: 'Filter by STE number',
    example: '004712',
  })
  @IsString()
  @IsOptional()
  steNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by sender name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiPropertyOptional({
    description: 'Filter by carrier',
    example: 'UPS',
  })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({
    description: 'Filter by shredded status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isShereded?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by forwarded status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isForwarded?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by received date start',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsOptional()
  receivedAtStart?: string;

  @ApiPropertyOptional({
    description: 'Filter by received date end',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  receivedAtEnd?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class PackageItemQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by package ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  packageId?: string;

  @ApiPropertyOptional({
    description: 'Search by item name',
    example: 'document',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by shredded status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isShereded?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by forwarded status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isForwarded?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by deleted status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// =====================
// BULK OPERATION DTOs
// =====================

export class BulkCreatePackageItemsDto {
  @ApiProperty({
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({
    description: 'Array of package items to create',
    type: [CreatePackageItemForPackageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePackageItemForPackageDto)
  items: CreatePackageItemForPackageDto[];
}

export class BulkUpdatePackageItemsDto {
  @ApiProperty({
    description: 'Array of package item updates',
    type: [Object],
  })
  @IsArray()
  @ValidateNested({ each: true })
  items: Array<{
    id: string;
    name?: string;
    description?: string;
    quantity?: number;
    weightKg?: number;
    width?: number;
    height?: number;
    length?: number;
    volumeDesi?: number;
    photoUrls?: string[];
    isShereded?: boolean;
    isForwarded?: boolean;
    isDeleted?: boolean;
  }>;
} 

export class CreateMailDto {
  @ApiProperty({
    description: 'STE number on the mail/package',
    example: '004712',
  })
  @IsString()
  @IsNotEmpty()
  steNumber: string;

  @ApiProperty({
    description: 'Mailbox ID (subscription ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({
    description: 'Date when mail was received',
    example: '2024-01-01T10:00:00.000Z',
  })
  @IsDateString()
  receivedAt: string;

  @ApiProperty({
    description: 'Mail type',
    enum: MailType,
    example: MailType.PACKAGE,
  })
  @IsEnum(MailType)
  type: MailType;

  @ApiPropertyOptional({
    description: 'Sender name',
    example: 'John Doe Company',
  })
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiPropertyOptional({
    description: 'Sender address',
    example: '123 Main St, New York, NY 10001',
  })
  @IsString()
  @IsOptional()
  senderAddress?: string;

  @ApiPropertyOptional({
    description: 'Carrier company',
    example: 'UPS',
  })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 30.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 20.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 15.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  length?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 2.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Volume in desi',
    example: 9.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  volumeDesi?: number;

  @ApiPropertyOptional({
    description: 'Photo URLs',
    example: ['https://s3.amazonaws.com/bucket/mail1.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];

  @ApiPropertyOptional({
    description: 'Mail status',
    enum: PackageStatus,
    example: PackageStatus.PENDING,
    default: PackageStatus.PENDING,
  })
  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus;

  @ApiPropertyOptional({
    description: 'Current status',
    enum: PackageStatus,
    example: PackageStatus.PENDING,
    default: PackageStatus.PENDING,
  })
  @IsEnum(PackageStatus)
  @IsOptional()
  currentStatus?: PackageStatus;

  @ApiPropertyOptional({
    description: 'Is mail shredded',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isShereded?: boolean;

  @ApiPropertyOptional({
    description: 'Is mail forwarded',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isForwarded?: boolean;
}

export class UpdateMailDto extends PartialType(CreateMailDto) {}

export class MailResponseDto {
  @ApiProperty({
    description: 'Mail ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'STE number on the mail/package',
    example: '004712',
  })
  steNumber: string;

  @ApiProperty({
    description: 'Mailbox ID (subscription ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Date when mail was received',
    example: '2024-01-01T10:00:00.000Z',
  })
  receivedAt: Date;

  @ApiProperty({
    description: 'Is mail shredded',
    example: false,
  })
  isShereded: boolean;

  @ApiProperty({
    description: 'Is mail forwarded',
    example: false,
  })
  isForwarded: boolean;

  @ApiProperty({
    description: 'Current mail status',
    enum: PackageStatus,
    example: PackageStatus.PENDING,
  })
  currentStatus: PackageStatus;

  @ApiProperty({
    description: 'Mail type',
    enum: MailType,
    example: MailType.PACKAGE,
  })
  type: MailType;

  @ApiPropertyOptional({
    description: 'Sender name',
    example: 'John Doe Company',
  })
  senderName?: string;

  @ApiPropertyOptional({
    description: 'Sender address',
    example: '123 Main St, New York, NY 10001',
  })
  senderAddress?: string;

  @ApiPropertyOptional({
    description: 'Carrier company',
    example: 'UPS',
  })
  carrier?: string;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 30.0,
  })
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 20.0,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 15.0,
  })
  length?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 2.5,
  })
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Volume in desi',
    example: 9.0,
  })
  volumeDesi?: number;

  @ApiPropertyOptional({
    description: 'Photo URLs',
    example: ['https://s3.amazonaws.com/bucket/mail1.jpg'],
    type: [String],
  })
  photoUrls?: string[];

  @ApiProperty({
    description: 'Mail status',
    enum: PackageStatus,
    example: PackageStatus.PENDING,
  })
  status: PackageStatus;

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
    description: 'Mailbox details',
  })
  mailbox?: any;

  @ApiPropertyOptional({
    description: 'Package actions',
    type: [Object],
  })
  actions?: any[];

  @ApiPropertyOptional({
    description: 'Forwarding requests',
    type: [Object],
  })
  forwardRequests?: any[];
}