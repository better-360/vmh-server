export interface CheckoutAddon{
    productId: string;
    selectedPriceId: string | null;
    productName: string|null;
    productTier: string|null;
    price: number;
  }

  export interface CompanyInfo{
    name: string;
    designator: string;
  }

  export interface CompanyType {
    id: string;
    name: string;
  }

  export interface State {
    id: string;
    name: string;
  }

  export interface PricingPlan{
    id: string;
    name: string;
    price: number;
  }

export interface StateFee{
  id: string;
  amount: number;
}

export interface FillingOption{
  id: string;
  name: string;
  price: number;
}

  export interface CheckoutData{  
    companyInfo: CompanyInfo;
    state: State;
    companyType: CompanyType;
    pricingPlan: PricingPlan;
    stateFee: StateFee;
    expeditedFee: FillingOption;
    addons: CheckoutAddon[];
  }
