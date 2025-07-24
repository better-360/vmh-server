export enum WorkspaceRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER'
}

export enum DeliveryAddressType {
  DELIVERY = 'DELIVERY',
  BILLING = 'BILLING',
  PICKUP = 'PICKUP'
}

export interface ICreateWorkspace {
  name: string;
}

export interface IUpdateWorkspace {
  name?: string;
  isActive?: boolean;
}

export interface IAddWorkspaceMember {
  email: string;
  role: WorkspaceRole;
}

export interface IUpdateWorkspaceMember {
  role: WorkspaceRole;
}

export interface ICreateWorkspaceAddress {
  officeLocationId: string;
  isDefault?: boolean;
}

export interface IUpdateWorkspaceAddress {
  isActive?: boolean;
  isDefault?: boolean;
}

export interface ICreateWorkspaceDeliveryAddress {
  type: DeliveryAddressType;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  isDefault?: boolean;
}

export interface IUpdateWorkspaceDeliveryAddress {
  type?: DeliveryAddressType;
  label?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  isDefault?: boolean;
}

export interface IInviteToWorkspace {
  emails: string[];
  role: WorkspaceRole;
}

export interface ICreateWorkspaceSubscription {
  officeLocationId: string;
  planId: string;
  billingCycle: string;
}

export interface IWorkspaceQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface IWorkspaceResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
  userRole?: WorkspaceRole;
}

export interface IWorkspaceDetailResponse extends IWorkspaceResponse {
  members?: any[];
  addresses?: any[];
  deliveryAddresses?: any[];
  subscriptions?: any[];
} 