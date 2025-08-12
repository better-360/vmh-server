  import { RoleType,  WorkspaceRole } from '@prisma/client';

  export interface IWorkspaceMember {
    workspaceId: string;
    role: WorkspaceRole;
    joinedAt: string;
  }

  export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    telephone?: string;
    stripeCustomerId?: string;
    profileImage?: string;
    notifications: boolean;
    emailConfirmed: boolean;
    telephoneConfirmed: boolean;
    lastLogin?: Date;
    isActive: boolean;
    roles: RoleType[];
    address?: Address;
    createdAt: Date;
    workspaces?: IWorkspaceMember[]| any[];
  }

export interface Address {
  country: string;
  city: string;
  state: string;
  zipCode: string;
  streetAddress: string;
}

export interface CompanyUser {
  companyId: string;
  role: RoleType;
  createdAt: Date;
}

