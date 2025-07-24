export interface IRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  fcmId?: string;
}

export interface ILogin {
  email: string;
  password: string;
  fcmId?: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface IGoogleSignIn {
  idToken: string;
}

export interface IToken {
  refreshToken: string;
}

export interface IUserTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IResetPassword {
  email: string;
  password: string;
}

export interface IVerifyResetToken {
  token: string;
  email: string;
} 