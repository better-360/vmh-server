export interface IAddonDto {
  productId: string;
  selectedPriceId?: string;
}

export interface ICheckoutAddon {
  productId: string;
  selectedPriceId: string | null;
  productName: string | null;
  productTier: string | null;
  price: number;
}

export interface ICompanyInfo {
  name: string;
  designator: string;
}

export interface ICompanyType {
  id: string;
  name: string;
}

export interface IState {
  id: string;
  name: string;
}

export interface IPricingPlan {
  id: string;
  name: string;
  price: number;
}

export interface IStateFee {
  id: string;
  amount: number;
}

export interface IFillingOption {
  id: string;
  name: string;
  price: number;
}

export interface ICheckoutData {
  companyInfo: ICompanyInfo;
  state: IState;
  companyType: ICompanyType;
  pricingPlan: IPricingPlan;
  stateFee: IStateFee;
  expeditedFee: IFillingOption;
  addons: ICheckoutAddon[];
}

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

export interface ICreateOrderItem {
  itemType: OrderItemType;
  itemId: string;
  quantity?: number;
}

export interface ICreateInitialSubscriptionOrder {
  firstName: string;
  lastName: string;
  email: string;
  officeLocationId: string;
  items: ICreateOrderItem[];
}

export interface ICreateOrder {
  subscriptionId: string;
  items: ICreateOrderItem[];
}

export interface IOrderItemResponse {
  id: string;
  itemType: OrderItemType;
  itemId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  itemName: string;
  itemDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderResponse {
  id: string;
  email: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  stripeCustomerId: string;
  stripeClientSecret?: string;
  userId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  type: string; // OrderType enum from Prisma
  items: IOrderItemResponse[];
}

export interface IInitialSubscriptionOrderResponse extends IOrderResponse {
  firstName: string;
  lastName: string;
}

export interface ICheckoutCalculation {
  email: string;
  planPriceId: string;
  addons?: IAddonDto[];
} 