export interface ICreateShippingSpeed {
  label: string;
  title: string;
  description?: string;
  price: number;
}

export interface IUpdateShippingSpeed {
  label?: string;
  title?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export interface IAssignShippingSpeedToLocation {
  deliverySpeedId: string;
  officeLocationId: string;
  price?: number;
  isActive?: boolean;
} 