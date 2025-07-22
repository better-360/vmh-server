import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEnum,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType } from '@prisma/client';
import { CreateWorkspaceSubscriptionItemDto } from './plan.dto';

export class AddonDto {
  @IsUUID()
  productId: string;

  // Eğer ürünün varyasyonları varsa, seçilen fiyatın ID'si
  @IsOptional()
  @IsUUID()
  selectedPriceId: string;
}

export interface CheckoutAddon{
    productId: string;
    selectedPriceId: string | null;
    productName: string|null;
    productTier: string|null;
    price: number;
  }

  export interface CompanyInfo{
    name: string;
    designator: string;
  }

  export interface CompanyType {
    id: string;
    name: string;
  }

  export interface State {
    id: string;
    name: string;
  }

  export interface PricingPlan{
    id: string;
    name: string;
    price: number;
  }

export interface StateFee{
  id: string;
  amount: number;
}

export interface FillingOption{
  id: string;
  name: string;
  price: number;
}

  export interface CheckoutData{  
    companyInfo: CompanyInfo;
    state: State;
    companyType: CompanyType;
    pricingPlan: PricingPlan;
    stateFee: StateFee;
    expeditedFee: FillingOption;
    addons: CheckoutAddon[];
  }

// =====================
// ORDER DTOs
// =====================

export enum OrderItemType {
  PLAN = 'PLAN',
  ADDON = 'ADDON', 
  PRODUCT = 'PRODUCT',
}

export enum OrderStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  ERROR = 'ERROR',
  PROGRESS_ERROR = 'PROGRESS_ERROR',
  FAILED = 'FAILED',
}

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Item type',
    enum: OrderItemType,
    example: OrderItemType.PLAN,
  })
  @IsEnum(OrderItemType)
  itemType: OrderItemType;

  @ApiProperty({
    description: 'Item ID (Plan, Addon, or Product ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  itemId: string;

  @ApiPropertyOptional({
    description: 'Quantity',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
export class CreateInitialSubscriptionOrderDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'John',
  })
  @IsString()
  firstName: string;

    @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'atakan@thedice.ai',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  officeLocationId: string;

  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}


export class CreateOrderDto {
  @ApiProperty({
    description: 'Subscription ID to add item to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({
    description: 'Item',
    type: CreateOrderItemDto,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

}

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OrderItemType })
  itemType: OrderItemType;

  @ApiProperty()
  itemId: string;

  @ApiPropertyOptional()
  variantId?: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  itemName: string;

  @ApiPropertyOptional()
  itemDescription?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiPropertyOptional()
  stripePaymentIntentId?: string;

  @ApiProperty()
  stripeCustomerId: string;

  @ApiPropertyOptional()
  stripeClientSecret?: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiPropertyOptional()
  metadata?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty({ enum: OrderType })
  type: OrderType;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
}

export class InitialSubscriptionOrderResponseDto extends OrderResponseDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
  })
  @IsString()
  firstName: string;

    @ApiProperty({
    description: 'Customer last name',
    example: 'John Doe',
  })
  @IsString()
  lastName: string;
}

export class CheckoutCalculationDto {
  @ApiProperty({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Plan Price ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  planPriceId: string;

  @ApiPropertyOptional({
    description: 'Selected addons',
    type: [AddonDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddonDto)
  addons?: AddonDto[];
}
