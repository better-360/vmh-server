import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BillingCycle,
  OrderType,
  ProductType,
  SubscriptionItemStatus,
  OrderStatus,
  OrderItemType,
} from '@prisma/client';

// Re-export Prisma enums so other modules can import from this DTO without changes
export { OrderItemType, OrderStatus } from '@prisma/client';

export class AddonDto {
  @ApiProperty({
    description: 'Addon product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Selected price ID for the chosen variant (optional)',
    example: '123e4567-e89b-12d3-a456-426614174999',
  })
  @IsOptional()
  @IsUUID()
  selectedPriceId?: string;
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
    description: 'Customer first name',
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
    description: 'Customer email address',
    example: 'atakan@thedice.ai',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Office location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  officeLocationId: string;

  @ApiProperty({
    description: 'Plan Price ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  planPriceId: string;

  @ApiProperty({
    description: 'List of Add-on Price IDs',
    example: [
      '111e4567-e89b-12d3-a456-426614174000',
      '222e4567-e89b-12d3-a456-426614174000',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  addons: string[];
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
    description: 'Items to add to the order',
    type: [CreateOrderItemDto],
  })
  @IsArray()
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

  @ApiPropertyOptional()
  stripeCustomerId?: string;

  @ApiPropertyOptional()
  stripeSessionId?: string;

  @ApiPropertyOptional()
  stripeClientSecret?: string;

  @ApiPropertyOptional()
  userId?: string;
  
  @ApiPropertyOptional()
  stripeCheckoutUrl?: string;

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



export interface CreateSubscriptionItemDto {
  mailboxId: string;
  itemType: ProductType;
  itemId: string;
  priceId?: string;
  billingCycle?: BillingCycle;
  quantity?: number;
  unitPrice: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateSubscriptionItemDto {
  quantity?: number;
  unitPrice?: number;
  endDate?: Date;
  status?: SubscriptionItemStatus;
  isActive?: boolean;
}

export interface SubscriptionItemQueryDto {
  mailboxId?: string;
  itemType?: ProductType;
  status?: SubscriptionItemStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}