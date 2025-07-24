// =====================
// ENUMS
// =====================

export enum PackageType {
  BANK_CHECK = 'BANK_CHECK',
  LEGAL_DOCUMENT = 'LEGAL_DOCUMENT',
  ENVELOPE = 'ENVELOPE',
  PACKAGE = 'PACKAGE',
  OTHER = 'OTHER',
}

export enum PackageStatus {
  PENDING = 'PENDING',
  IN_PROCESS = 'IN_PROCESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// =====================
// PACKAGE ITEM INTERFACES
// =====================

export interface ICreatePackageItem {
  packageId: string;
  name: string;
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
}

export interface ICreatePackageItemForPackage {
  name: string;
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
}

export interface IUpdatePackageItem {
  packageId?: string;
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
}

export interface IPackageItemResponse {
  id: string;
  packageId: string;
  name: string;
  description?: string;
  quantity: number;
  weightKg?: number;
  width?: number;
  height?: number;
  length?: number;
  volumeDesi?: number;
  photoUrls?: string[];
  isShereded: boolean;
  isForwarded: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  package?: any;
}

// =====================
// PACKAGE INTERFACES
// =====================

export interface ICreatePackage {
  steNumber: string;
  workspaceAddressId: string;
  officeLocationId: string;
  type: PackageType;
  receivedAt: string;
  senderName?: string;
  senderAddress?: string;
  carrier?: string;
  width?: number;
  height?: number;
  length?: number;
  weightKg?: number;
  volumeDesi?: number;
  photoUrls?: string[];
  status?: PackageStatus;
  isShereded?: boolean;
  isForwarded?: boolean;
}

export interface IUpdatePackage {
  steNumber?: string;
  workspaceAddressId?: string;
  officeLocationId?: string;
  type?: PackageType;
  receivedAt?: string;
  senderName?: string;
  senderAddress?: string;
  carrier?: string;
  width?: number;
  height?: number;
  length?: number;
  weightKg?: number;
  volumeDesi?: number;
  photoUrls?: string[];
  status?: PackageStatus;
  isShereded?: boolean;
  isForwarded?: boolean;
}

export interface IPackageResponse {
  id: string;
  steNumber: string;
  workspaceAddressId: string;
  officeLocationId: string;
  type: PackageType;
  receivedAt: Date;
  senderName?: string;
  senderAddress?: string;
  carrier?: string;
  width?: number;
  height?: number;
  length?: number;
  weightKg?: number;
  volumeDesi?: number;
  photoUrls?: string[];
  status: PackageStatus;
  isShereded: boolean;
  isForwarded: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: IPackageItemResponse[];
  workspaceAddress?: any;
  officeLocation?: any;
  actions?: any[];
  forwardRequests?: any[];
}

// =====================
// QUERY INTERFACES
// =====================

export interface IPackageQuery {
  workspaceAddressId?: string;
  officeLocationId?: string;
  type?: PackageType;
  status?: PackageStatus;
  steNumber?: string;
  senderName?: string;
  carrier?: string;
  isShereded?: boolean;
  isForwarded?: boolean;
  receivedAtStart?: string;
  receivedAtEnd?: string;
  page?: number;
  limit?: number;
}

export interface IPackageItemQuery {
  packageId?: string;
  search?: string;
  isShereded?: boolean;
  isForwarded?: boolean;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
}

// =====================
// BULK OPERATION INTERFACES
// =====================

export interface IBulkCreatePackageItems {
  packageId: string;
  items: ICreatePackageItemForPackage[];
}

export interface IBulkUpdatePackageItems {
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