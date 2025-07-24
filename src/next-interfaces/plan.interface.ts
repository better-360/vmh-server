// =====================
// ENUMS
// =====================

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  QUARTERLY = 'QUARTERLY',
  WEEKLY = 'WEEKLY'
}

// =====================
// PLAN INTERFACES
// =====================

export interface ICreatePlan {
  officeLocationId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ICreatePlanFeatureForPlan {
  featureId: string;
  includedLimit?: number;
  unitPrice?: number;
  isActive?: boolean;
}

export interface ICreatePlanPriceForPlan {
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  description?: string;
  stripePriceId?: string;
  isActive?: boolean;
}

export interface ICreatePlanWithFeatures {
  officeLocationId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  features: ICreatePlanFeatureForPlan[];
  prices: ICreatePlanPriceForPlan[];
}

export interface IUpdatePlan {
  officeLocationId?: string;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IFormattedOfficeLocation {
  id: string;
  label: string;
  city: string;
  state: string;
}

export interface IFormattedPlanPrice {
  id: string;
  billingCycle: string;
  amount: number;
  currency: string;
  description: string;
  stripePriceId: string;
}

export interface IFormattedPlanFeature {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  includedLimit: number;
  unitPrice: number;
  displayOrder: number;
}

export interface IFormattedPlanResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  officeLocation: IFormattedOfficeLocation;
  prices: IFormattedPlanPrice[];
  features: IFormattedPlanFeature[];
}

export interface IPlanResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  officeLocationId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  features?: any[];
  prices?: any[];
}

// =====================
// PLAN PRICE INTERFACES
// =====================

export interface ICreatePlanPrice {
  planId: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  description?: string;
  stripePriceId?: string;
  isActive?: boolean;
}

export interface IUpdatePlanPrice {
  planId?: string;
  billingCycle?: BillingCycle;
  amount?: number;
  currency?: string;
  description?: string;
  stripePriceId?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IPlanPriceResponse {
  id: string;
  planId: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  description?: string;
  stripePriceId?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// =====================
// FEATURE INTERFACES
// =====================

export interface ICreateFeature {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface IUpdateFeature {
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IFeatureResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
}

// =====================
// PLAN FEATURE INTERFACES
// =====================

export interface ICreatePlanFeature {
  planId: string;
  featureId: string;
  includedLimit?: number;
  unitPrice?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export interface IUpdatePlanFeature {
  planId?: string;
  featureId?: string;
  includedLimit?: number;
  unitPrice?: number;
  isActive?: boolean;
  displayOrder?: number;
  isDeleted?: boolean;
}

export interface IPlanFeatureResponse {
  id: string;
  planId: string;
  featureId: string;
  includedLimit?: number;
  unitPrice?: number;
  plan?: IPlanResponse;
  feature?: IFeatureResponse;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
}

// =====================
// SUBSCRIPTION INTERFACES (Office Location Based)
// =====================

export interface ICreateOfficeSubscription {
  userId: string;
  officeLocationId: string;
  planId: string;
  billingCycle: BillingCycle;
  stripeSubscriptionId?: string;
  startDate: Date;
  endDate?: Date;
}

export interface IUpdateOfficeSubscription {
  userId?: string;
  officeLocationId?: string;
  planId?: string;
  billingCycle?: BillingCycle;
  stripeSubscriptionId?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface IOfficeSubscriptionResponse {
  id: string;
  userId: string;
  officeLocationId: string;
  planId: string;
  billingCycle: BillingCycle;
  stripeSubscriptionId?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  plan?: IPlanPriceResponse;
  user?: any;
  officeLocation?: any;
}

export interface IOfficeSubscriptionQuery {
  userId?: string;
  officeLocationId?: string;
  planId?: string;
  billingCycle?: BillingCycle;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// =====================
// WORKSPACE SUBSCRIPTION INTERFACES
// =====================

export interface ICreateWorkspaceSubscriptionItem {
  itemType: 'PRODUCT' | 'ADDON';
  itemId: string;
  variantId?: string;
  billingCycle: BillingCycle;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
  itemName: string;
  itemDescription?: string;
}

export interface ICreateInitialSubscription {
  workspaceId: string;
  officeLocationId: string;
  planPriceId: string;
  stripeSubscriptionId?: string;
  startDate: Date;
  items?: ICreateWorkspaceSubscriptionItem[];
}

export interface IAddItemToSubscription {
  subscriptionId: string;
  item: ICreateWorkspaceSubscriptionItem;
}

export interface IUpdateWorkspaceSubscription {
  stripeSubscriptionId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface IUpdateWorkspaceSubscriptionItem {
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  startDate?: Date;
  endDate?: Date;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  isActive?: boolean;
}

export interface IWorkspaceSubscriptionQuery {
  workspaceId?: string;
  officeLocationId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// =====================
// FEATURE USAGE INTERFACES (Office Location Based)
// =====================

export interface ICreateFeatureUsage {
  userId: string;
  officeLocationId: string;
  featureId: string;
  usedAt: Date;
  usedCount: number;
}

export interface IUpdateFeatureUsage {
  usedCount: number;
}

export interface IFeatureUsageResponse {
  id: string;
  userId: string;
  officeLocationId: string;
  featureId: string;
  usedAt: Date;
  usedCount: number;
  user?: any;
  officeLocation?: any;
  feature?: IFeatureResponse;
}

export interface IFeatureUsageQuery {
  userId?: string;
  officeLocationId?: string;
  featureId?: string;
  usedAt?: Date;
  page?: number;
  limit?: number;
}

// =====================
// QUERY INTERFACES
// =====================

export interface IPlanQuery {
  isActive?: boolean;
  isDeleted?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IPlanPriceQuery {
  planId?: string;
  billingCycle?: BillingCycle;
  currency?: string;
  isActive?: boolean;
}

export interface IFeatureQuery {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IPlanFeatureQuery {
  planId?: string;
  featureId?: string;
}

// =====================
// BULK OPERATION INTERFACES
// =====================

export interface IBulkCreatePlanFeatures {
  planId: string;
  features: Omit<ICreatePlanFeature, 'planId'>[];
}

export interface IBulkUpdatePlanFeatures {
  features: Array<{
    id: string;
    includedLimit?: number;
    unitPrice?: number;
  }>;
}

// =====================
// WORKSPACE FEATURE USAGE INTERFACES (Workspace Based)
// =====================

export interface ICreateWorkspaceFeatureUsage {
  workspaceId: string;
  officeLocationId: string;
  featureId: string;
  usedAt: Date;
  usedCount: number;
}

export interface IUpdateWorkspaceFeatureUsage {
  usedCount: number;
}

export interface IWorkspaceFeatureUsageResponse {
  id: string;
  workspaceId: string;
  officeLocationId: string;
  featureId: string;
  usedAt: Date;
  usedCount: number;
  workspace?: any;
  officeLocation?: any;
  feature?: IFeatureResponse;
}

export interface IWorkspaceFeatureUsageQuery {
  workspaceId?: string;
  officeLocationId?: string;
  featureId?: string;
  usedAt?: Date;
  page?: number;
  limit?: number;
}

// =====================
// PLAN TEMPLATE INTERFACES
// =====================

export interface ICreatePlanTemplate {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  priceMonthly: number;
  priceYearly: number;
  currency?: string;
  isActive?: boolean;
  features?: ICreatePlanTemplateFeature[];
}

export interface IUpdatePlanTemplate {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  priceMonthly?: number;
  priceYearly?: number;
  currency?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IPlanTemplateResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  features?: any[];
}

export interface ICreatePlanTemplateFeature {
  featureId: string;
  includedLimit?: number;
  unitPrice?: number;
  isRequired?: boolean;
  displayOrder?: number;
}

export interface IUpdatePlanTemplateFeature {
  featureId?: string;
  includedLimit?: number;
  unitPrice?: number;
  isRequired?: boolean;
  displayOrder?: number;
}

export interface IPlanTemplateQuery {
  isActive?: boolean;
  isDeleted?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ICreatePlanFromTemplate {
  templateId: string;
  officeLocationId: string;
  name?: string;
  slug?: string;
  priceMonthly?: number;
  priceYearly?: number;
  currency?: string;
} 