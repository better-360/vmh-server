// =====================
// ADDON INTERFACES
// =====================

export interface ICreateAddon {
  name: string;
  description?: string;
  stripeProductId?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface IUpdateAddon {
  name?: string;
  description?: string;
  stripeProductId?: string;
  imageUrl?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IAddonResponse {
  id: string;
  name: string;
  description?: string;
  stripeProductId?: string;
  imageUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  variants?: any[];
}

// =====================
// ADDON VARIANT INTERFACES
// =====================

export interface ICreateAddonVariant {
  addonId: string;
  name: string;
  description?: string;
  stripePriceId?: string;
  price: number;
  currency: string;
  imageUrl?: string;
}

export interface ICreateAddonVariantForAddon {
  name: string;
  description?: string;
  stripePriceId?: string;
  price: number;
  currency: string;
  imageUrl?: string;
}

export interface ICreateAddonWithVariants {
  name: string;
  description?: string;
  stripeProductId?: string;
  imageUrl?: string;
  isActive?: boolean;
  variants: ICreateAddonVariantForAddon[];
}

export interface IUpdateAddonVariant {
  addonId?: string;
  name?: string;
  description?: string;
  stripePriceId?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  isDeleted?: boolean;
}

export interface IAddonVariantResponse {
  id: string;
  addonId: string;
  name: string;
  description?: string;
  stripePriceId?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  addon?: IAddonResponse;
}

// =====================
// PLAN ADDON INTERFACES
// =====================

export interface ICreatePlanAddon {
  planId: string;
  addonId: string;
  isIncludedInPlan?: boolean;
  discountPercent?: number;
  isRequired?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ICreatePlanAddonForPlan {
  addonId: string;
  isIncludedInPlan?: boolean;
  discountPercent?: number;
  isRequired?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface IUpdatePlanAddon {
  planId?: string;
  addonId?: string;
  isIncludedInPlan?: boolean;
  discountPercent?: number;
  isRequired?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IPlanAddonResponse {
  id: string;
  planId: string;
  addonId: string;
  isIncludedInPlan: boolean;
  discountPercent?: number;
  isRequired: boolean;
  displayOrder?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  plan?: any;
  addon?: IAddonResponse;
}

// =====================
// QUERY INTERFACES
// =====================

export interface IAddonQuery {
  isActive?: boolean;
  isDeleted?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IAddonVariantQuery {
  addonId?: string;
  currency?: string;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
}

export interface IPlanAddonQuery {
  planId?: string;
  addonId?: string;
  isIncludedInPlan?: boolean;
  isRequired?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
}

// =====================
// BULK OPERATION INTERFACES
// =====================

export interface IBulkCreatePlanAddons {
  planId: string;
  addons: ICreatePlanAddonForPlan[];
}

export interface IBulkUpdatePlanAddons {
  addons: Array<{
    id: string;
    isIncludedInPlan?: boolean;
    discountPercent?: number;
    isRequired?: boolean;
    displayOrder?: number;
    isActive?: boolean;
  }>;
} 