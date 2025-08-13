// =====================
// MAIL INTERFACES (formerly Package)
// =====================

export interface IMail {
  id: string;
  steNumber: string;
  subscriptionId: string;
  receivedAt: Date;
  isShereded: boolean;
  isForwarded: boolean;
  type: 'BANK_CHECK' | 'LEGAL_DOCUMENT' | 'ENVELOPE' | 'PACKAGE' | 'OTHER';
  senderName?: string;
  senderAddress?: string;
  carrier?: string;
  width?: number;
  height?: number;
  length?: number;
  weightKg?: number;
  volumeDesi?: number;
  photoUrls?: string[];
  status: 'PENDING' | 'FORWARDED' | 'SHREDDED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROCESS';
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  mailbox?: IMailbox;
  actions?: IPackageAction[];
  forwardRequests?: IForwardingRequest[];
}

export interface ICreateMail {
  steNumber: string;
  subscriptionId: string;
  receivedAt: string;
  type: 'BANK_CHECK' | 'LEGAL_DOCUMENT' | 'ENVELOPE' | 'PACKAGE' | 'OTHER';
  senderName?: string;
  senderAddress?: string;
  carrier?: string;
  width?: number;
  height?: number;
  length?: number;
  weightKg?: number;
  volumeDesi?: number;
  photoUrls?: string[];
  status?: 'PENDING' | 'FORWARDED' | 'SHREDDED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROCESS';
  isShereded?: boolean;
  isForwarded?: boolean;
}

export interface IUpdateMail {
  steNumber?: string;
  subscriptionId?: string;
  receivedAt?: string;
  type?: 'BANK_CHECK' | 'LEGAL_DOCUMENT' | 'ENVELOPE' | 'PACKAGE' | 'OTHER';
  senderName?: string;
  senderAddress?: string;
  carrier?: string;
  width?: number;
  height?: number;
  length?: number;
  weightKg?: number;
  volumeDesi?: number;
  photoUrls?: string[];
  status?: 'PENDING' | 'FORWARDED' | 'SHREDDED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROCESS';
  isShereded?: boolean;
  isForwarded?: boolean;
}

// =====================
// PACKAGE ACTION INTERFACES
// =====================

export interface IPackageAction {
  id: string;
  packageId: string;
  type: 'FORWARD' | 'SHRED' | 'SCAN' | 'HOLD' | 'JUNK';
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED';
  requestedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
  meta?: any;
  
  // Relations
  mail: IMail;
}

// =====================
// FORWARDING REQUEST INTERFACES
// =====================

export interface IForwardingRequest {
  id: string;
  mailId: string;
  workspaceId: string;
  officeLocationId: string;
  deliveryAddressId: string;
  deliverySpeedOptionId: string;
  packagingTypeOptionId: string;
  carrierId?: string;
  trackingCode?: string;
  shippingCost: number;
  packagingCost: number;
  totalCost: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'CHARGEBACK' | 'CANCELLED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  // Relations
  mail?: IMail;
  subscription?: IMailbox;
  officeLocation?: IOfficeLocation;
  deliveryAddress?: IDeliveryAddress;
  deliverySpeedOption?: IDeliverySpeedOption;
  packagingTypeOption?: IPackagingTypeOption;
  carrier?: ICarrier;
}

export interface ICreateForwardingRequest {
  mailId: string;
  workspaceId: string;
  officeLocationId: string;
  deliveryAddressId: string;
  deliverySpeedOptionId: string;
  packagingTypeOptionId: string;
  carrierId?: string;
  shippingCost: number;
  packagingCost: number;
  totalCost: number;
  trackingCode?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'CHARGEBACK' | 'CANCELLED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
}

export interface IUpdateForwardingRequest {
  mailId?: string;
  workspaceId?: string;
  officeLocationId?: string;
  deliveryAddressId?: string;
  deliverySpeedOptionId?: string;
  packagingTypeOptionId?: string;
  carrierId?: string;
  trackingCode?: string;
  shippingCost?: number;
  packagingCost?: number;
  totalCost?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'CHARGEBACK' | 'CANCELLED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  completedAt?: string;
  cancelledAt?: string;
}

// Re-exports from other interfaces
interface IMailbox {
  id: string;
  workspaceId: string;
}

interface IOfficeLocation {
  id: string;
  label: string;
}

interface IDeliveryAddress {
  id: string;
  label: string;
  addressLine: string;
}

interface IDeliverySpeedOption {
  id: string;
  label: string;
  title: string;
  price: number;
}

interface IPackagingTypeOption {
  id: string;
  label: string;
  title: string;
}

interface ICarrier {
  id: string;
  name: string;
  logoUrl?: string;
}