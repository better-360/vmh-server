import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsStrongPassword, IsOptional, IsUUID, IsBoolean, IsEnum, IsNotEmpty, IsInt, IsPositive, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum WorkspaceRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER'
}

export enum DeliveryAddressType {
  DELIVERY = 'DELIVERY',
  BILLING = 'BILLING',
  PICKUP = 'PICKUP'
}

// Workspace oluşturma DTO'su
export class CreateWorkspaceDto {
  @ApiProperty({ description: 'Workspace adı', example: 'Şirket Adı' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

// Workspace güncelleme DTO'su
export class UpdateWorkspaceDto {
  @ApiProperty({ description: 'Workspace adı', example: 'Yeni Şirket Adı', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: 'Workspace aktif durumu', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Workspace üyesi ekleme DTO'su
export class AddWorkspaceMemberDto {
  @ApiProperty({ description: 'Kullanıcı email adresi', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Workspace rolü', enum: WorkspaceRole, example: WorkspaceRole.MEMBER })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}

// Workspace üyesi güncelleme DTO'su
export class UpdateWorkspaceMemberDto {
  @ApiProperty({ description: 'Workspace rolü', enum: WorkspaceRole, example: WorkspaceRole.MEMBER })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}

// Workspace adres oluşturma DTO'su
export class CreateWorkspaceAddressDto {
  @ApiProperty({ description: 'Ofis lokasyonu ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  officeLocationId: string;

  @ApiProperty({ description: 'Varsayılan adres mi?', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// Workspace adres güncelleme DTO'su
export class UpdateWorkspaceAddressDto {
  @ApiProperty({ description: 'Adres aktif durumu', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Varsayılan adres mi?', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// Workspace teslimat adresi oluşturma DTO'su
export class CreateWorkspaceDeliveryAddressDto {
  @ApiProperty({ description: 'Adres tipi', enum: DeliveryAddressType, example: DeliveryAddressType.DELIVERY })
  @IsEnum(DeliveryAddressType)
  type: DeliveryAddressType;

  @ApiProperty({ description: 'Adres etiketi', example: 'Ev' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Adres satırı', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @ApiProperty({ description: 'Şehir', example: 'İstanbul' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Eyalet/İl', example: 'Marmara' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Ülke', example: 'Türkiye' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Posta kodu', example: '34000', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ description: 'Varsayılan adres mi?', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// Workspace teslimat adresi güncelleme DTO'su
export class UpdateWorkspaceDeliveryAddressDto {
  @ApiProperty({ description: 'Adres tipi', enum: DeliveryAddressType, required: false })
  @IsOptional()
  @IsEnum(DeliveryAddressType)
  type?: DeliveryAddressType;

  @ApiProperty({ description: 'Adres etiketi', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  label?: string;

  @ApiProperty({ description: 'Adres satırı', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressLine?: string;

  @ApiProperty({ description: 'Şehir', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ApiProperty({ description: 'Eyalet/İl', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state?: string;

  @ApiProperty({ description: 'Ülke', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;

  @ApiProperty({ description: 'Posta kodu', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ description: 'Varsayılan adres mi?', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// Workspace davet DTO'su
export class InviteToWorkspaceDto {
  @ApiProperty({ description: 'Davet edilecek kullanıcıların email adresleri', example: ['user1@example.com', 'user2@example.com'] })
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @ApiProperty({ description: 'Workspace rolü', enum: WorkspaceRole, example: WorkspaceRole.MEMBER })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}

// Workspace abonelik DTO'su
export class CreateWorkspaceSubscriptionDto {
  @ApiProperty({ description: 'Ofis lokasyonu ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  officeLocationId: string;

  @ApiProperty({ description: 'Plan ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  planId: string;

  @ApiProperty({ description: 'Fatura döngüsü', example: 'MONTHLY' })
  @IsString()
  @IsNotEmpty()
  billingCycle: string;
}

// Workspace listesi query DTO'su
export class WorkspaceQueryDto {
  @ApiProperty({ description: 'Sayfa numarası', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiProperty({ description: 'Sayfa başına kayıt sayısı', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @ApiProperty({ description: 'Arama terimi', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Sadece aktif workspace\'ler', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

// Workspace response DTO'su
export class WorkspaceResponseDto {
  @ApiProperty({ description: 'Workspace ID' })
  id: string;

  @ApiProperty({ description: 'Workspace adı' })
  name: string;

  @ApiProperty({ description: 'Aktif durumu' })
  isActive: boolean;

  @ApiProperty({ description: 'Oluşturulma tarihi' })
  createdAt: Date;

  @ApiProperty({ description: 'Güncellenme tarihi' })
  updatedAt: Date;

  @ApiProperty({ description: 'Üye sayısı', required: false })
  memberCount?: number;

  @ApiProperty({ description: 'Kullanıcının rolü', enum: WorkspaceRole, required: false })
  userRole?: WorkspaceRole;
}

// Workspace detay response DTO'su
export class WorkspaceDetailResponseDto extends WorkspaceResponseDto {
  @ApiProperty({ description: 'Workspace üyeleri', type: [Object], required: false })
  members?: any[];

  @ApiProperty({ description: 'Workspace adresleri', type: [Object], required: false })
  addresses?: any[];

  @ApiProperty({ description: 'Teslimat adresleri', type: [Object], required: false })
  deliveryAddresses?: any[];

  @ApiProperty({ description: 'Abonelikler', type: [Object], required: false })
  subscriptions?: any[];
}
