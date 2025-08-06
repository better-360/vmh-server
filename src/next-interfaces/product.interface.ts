// =====================
// PRODUCT INTERFACES
// =====================

export interface IProduct {
  id: string;
  name: string;
  description?: string;
  stripeProductId?: string;
  type: 'ADDON' | 'PRODUCT' | 'OTHER';
  imageUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relations
  prices?: IPrice[];
  productFeature?: IProductFeature[];
  planAddon?: IPlanAddon[];
}

export interface ICreateProduct {
  name: string;
  description?: string;
  stripeProductId?: string;
  type: 'ADDON' | 'PRODUCT' | 'OTHER';
  imageUrl?: string;
  isActive?: boolean;
}

export interface IUpdateProduct {
  name?: string;
  description?: string;
  stripeProductId?: string;
  type?: 'ADDON' | 'PRODUCT' | 'OTHER';
  imageUrl?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

// =====================
// PRICE INTERFACES
// =====================

export interface IPrice {
  id: string;
  name?: string;
  isDefault: boolean;
  additionalFees?: number;
  stripePriceId?: string;
  unit_amount: number;
  currency: string;
  productId: string;
  priceType: 'one_time' | 'recurring';
  recurringId?: string;
  description?: string;
  active: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relations
  product?: IProduct;
  recurring?: IRecurring;
  planAddons?: IPlanAddon[];
}

export interface ICreatePrice {
  name?: string;
  isDefault?: boolean;
  additionalFees?: number;
  stripePriceId?: string;
  unit_amount: number;
  currency: string;
  productId: string;
  description?: string;
  recurringId?: string;
}

export interface IUpdatePrice {
  name?: string;
  isDefault?: boolean;
  additionalFees?: number;
  stripePriceId?: string;
  unit_amount?: number;
  currency?: string;
  description?: string;
  active?: boolean;
  isDeleted?: boolean;
}

// =====================
// RECURRING INTERFACES
// =====================

export interface IRecurring {
  id: string;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  prices: IPrice[];
}

// =====================
// PRODUCT FEATURE INTERFACES
// =====================

export interface IProductFeature {
  id: string;
  productId: string;
  featureId: string;
  includedLimit?: number;
  resetCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'QUARTERLY' | 'ONE_TIME';
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  product: IProduct;
  feature: IFeature;
}

// =====================
// PLAN ADDON INTERFACES
// =====================

export interface IPlanAddon {
  id: string;
  planId: string;
  productId: string;
  productPriceId: string;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relations
  plan?: IPlan;
  product?: IProduct;
  prices?: IPrice;
}

// Re-exports from other interfaces
interface IFeature {
  id: string;
  name: string;
  description?: string;
}

interface IPlan {
  id: string;
  name: string;
  slug: string;
}