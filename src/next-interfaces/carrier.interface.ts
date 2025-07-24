export interface ICreateCarrier {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface IUpdateCarrier {
  name?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
} 