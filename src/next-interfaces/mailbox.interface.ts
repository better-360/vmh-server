// =====================
// MAILBOX INTERFACES
// =====================

export interface IMailbox {
  id: string;
  workspaceId: string;
  officeLocationId: string;
  planId: string;
  planPriceId: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'QUARTERLY' | 'ONE_TIME';
  stripeSubscriptionId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  forwardingAddressLimit: number;
  recipientLimit: number;
  
  // Relations
  workspace?: IWorkspace;
  officeLocation?: IOfficeLocation;
  plan?: IPlan;
  planPrice?: IPlanPrice;
  deliveryAddresses?: IDeliveryAddress[];
  featureUsages?: IFeatureUsage[];
  subscriptionItems?: ISubscriptionItem[];
  mails?: IMail[];
}

export interface ICreateMailbox {
  workspaceId: string;
  officeLocationId: string;
  planId: string;
  planPriceId: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'QUARTERLY' | 'ONE_TIME';
  stripeSubscriptionId?: string;
  startDate: string;
  endDate?: string;
  forwardingAddressLimit?: number;
  recipientLimit?: number;
}

export interface IUpdateMailbox {
  workspaceId?: string;
  officeLocationId?: string;
  planId?: string;
  planPriceId?: string;
  billingCycle?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'QUARTERLY' | 'ONE_TIME';
  stripeSubscriptionId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  forwardingAddressLimit?: number;
  recipientLimit?: number;
}

// Re-exports from other interfaces (these should be imported from their respective files)
interface IWorkspace {
  id: string;
  name: string;
  isActive: boolean;
}

interface IOfficeLocation {
  id: string;
  label: string;
  city: string;
  state: string;
  country: string;
}

interface IPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface IPlanPrice {
  id: string;
  planId: string;
  billingCycle: string;
  amount: number;
  currency: string;
}

interface IDeliveryAddress {
  id: string;
  mailBoxId: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
}

interface IFeatureUsage {
  id: string;
  mailBoxId: string;
  featureId: string;
  usedCount: number;
  periodStart: Date;
  periodEnd: Date;
}

interface ISubscriptionItem {
  id: string;
  mailboxId: string;
  itemType: string;
  itemId: string;
  quantity: number;
}

interface IMail {
  id: string;
  steNumber: string;
  subscriptionId: string;
  receivedAt: Date;
  type: string;
  status: string;
}