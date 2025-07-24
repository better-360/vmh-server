export interface IAddon {
  productId: string;
  productPriceId: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IRegisterUser {
  email: string;
  planPriceId: string;
  addons: IAddon[];
}

export interface IGetUserDetail {
  userId: string;
}

export interface ICheckEmailExist {
  email: string;
}

export interface IUpdateUser {
  firstName?: string;
  lastName?: string;
  telephone?: string;
  profileImage?: string;
  notifications?: boolean;
  isActivate?: boolean;
}

export interface IChangePasswordUser {
  currentPassword: string;
  newPassword: string;
}

export interface IChangeEmail {
  currentPassword: string;
  newEmail: string;
}

export interface ISafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telephone?: string;
  profileImage?: string;
  notifications: boolean;
  emailConfirmed: boolean;
  telephoneConfirmed: boolean;
  isActivate: boolean;
  createdAt: Date;
  deletedAt?: Date;
  roles: { id: string; role: 'USER' | 'ANALYST' | 'ADMIN' }[];
} 