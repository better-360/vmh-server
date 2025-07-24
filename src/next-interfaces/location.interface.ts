export interface ICreateOfficeLocation {
  label: string;
  addressLine: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  phone?: string;
  email?: string;
  workingHours?: string;
  timezone?: string;
}

export interface IUpdateOfficeLocation {
  label?: string;
  addressLine?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  phone?: string;
  email?: string;
  workingHours?: string;
  timezone?: string;
  isDeleted?: boolean;
}

export interface IOfficeLocationResponse {
  id: string;
  label: string;
  addressLine: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  plans?: any[];
  workspaceAddresses?: any[];
}

export interface IOfficeLocationQuery {
  search?: string;
  country?: string;
  state?: string;
  city?: string;
  page?: number;
  limit?: number;
} 