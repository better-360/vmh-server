// src/shipping/shipping.interfaces.ts

export interface Address {
  street1: string;
  street2?: string;
  city:    string;
  state:   string;
  zip:     string;
  country: string;
}

export interface Parcel {
  length: number; // inches
  width:  number;
  height: number;
  weight: number; // ounces
}

export interface Rate {
  id:             string;
  carrier:        string;
  service:        string;
  rate:           string;  // e.g. "12.34"
  currency:       string;  // e.g. "USD"
  delivery_date?: string;
  delivery_days?: number;
}

export interface PurchaseResult {
  shipmentId:    string;
  trackingCode:  string;
  labelUrl:      string;
  carrier:       string;
  service:       string;
}

export interface TrackerInfo {
  id:            string;
  trackingCode:  string;
  carrier:       string;
  status:        string;
}
