export interface ICreatePackagingOption {
  label: string;
  title: string;
  description?: string;
}

export interface IUpdatePackagingOption {
  label?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface IAssignPackagingOptionToLocation {
  packagingTypeId: string;
  officeLocationId: string;
  price?: number;
  isActive?: boolean;
} 