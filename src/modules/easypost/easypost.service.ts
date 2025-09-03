import { Injectable, Inject } from '@nestjs/common';
import { EasyPostClientType } from './easypost.constants';
import { Address, Parcel, PurchaseResult, Rate } from './shipping.interfaces';

@Injectable()
export class EasyPostService {
  constructor(
    @Inject('EASYPOST_CLIENT') private readonly client: EasyPostClientType,
  ) {}

  private normalizeCountry(country: string): string {
    if (!country) return 'US';
    const countryUpper = country.toUpperCase();
    if (countryUpper === 'UNITED STATES' || countryUpper === 'USA') return 'US';
    if (countryUpper === 'CANADA') return 'CA';
    if (countryUpper.length === 2) return countryUpper;
    return 'US';
  }

  async verifyAddress(addressData: {
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }) {
    return this.client.Address.createAndVerify(addressData);
  }

  async createShipment(params: {
    to_address: any;
    from_address: any;
    parcel: any;
  }) {
    try {
      console.log('Creating EasyPost shipment with params:', JSON.stringify(params, null, 2));
      
      // Address validation
      if (!params.from_address.street1 || !params.from_address.city || !params.from_address.state) {
        throw new Error('From address is missing required fields (street1, city, state)');
      }
      
      if (!params.to_address.street1 || !params.to_address.city || !params.to_address.state) {
        throw new Error('To address is missing required fields (street1, city, state)');
      }
      
      // Parcel validation
      if (!params.parcel.length || !params.parcel.width || !params.parcel.height || !params.parcel.weight) {
        throw new Error('Parcel is missing required dimensions (length, width, height, weight)');
      }
      
      const shipment = await this.client.Shipment.create(params);
      console.log('EasyPost shipment created successfully:', shipment.id);
      return shipment;
    } catch (error) {
      console.error('EasyPost createShipment error:', error);
      throw new Error(`Failed to create shipment: ${error.message}`);
    }
  }

  async track(trackerCode: string) {
    return this.client.Tracker.create({ tracking_code: trackerCode });
  }

  async getShipment(shipmentId: string) {
    try {
      return await this.client.Shipment.retrieve(shipmentId);
    } catch (error) {
      console.error('EasyPost getShipment error:', error);
      throw new Error(`Failed to retrieve shipment: ${error.message}`);
    }
  }

   async getAllRates(
    toAddress:   Address,
    fromAddress: Address,
    parcel:      Parcel,
  ): Promise<Rate[]> {
    try {
      // Shipment oluştur - daha detaylı adres bilgileri ile
      const shipment = await this.client.Shipment.create({
        to_address: {
          ...toAddress,
          country: this.normalizeCountry(toAddress.country),
          name: toAddress.name || 'Recipient',
        },
        from_address: {
          ...fromAddress,
          country: this.normalizeCountry(fromAddress.country),
          name: fromAddress.name || 'VMH Office',
        },
        parcel: {
          ...parcel,
          predefined_package: null, // Custom package boyutları kullan
        },
        options: {
          // Daha fazla carrier'dan rate almak için
          carrier_accounts: [], // Boş bırakarak tüm available carrier'ları kullan
          delivery_confirmation: 'SIGNATURE', // Opsiyonel
        }
      });
      return shipment.rates as Rate[];
    } catch (error) {
      console.error('EasyPost getAllRates error:', error);
      throw new Error(`Failed to get shipping rates: ${error.message}`);
    }
  }

  async purchaseShipment(
    shipmentId: string,
    rateId:     string,
  ): Promise<PurchaseResult> {
    try {
      // Label'ı satın al
      const bought: any = await this.client.Shipment.buy(shipmentId, rateId);

      return {
        shipmentId:   bought.id,
        trackingCode: bought.tracking_code,
        labelUrl:     bought.postage_label?.label_url,
        carrier:      bought.selected_rate?.carrier || bought.carrier,
        service:      bought.selected_rate?.service,
      };
    } catch (error) {
      throw new Error(`Failed to purchase shipment: ${error.message}`);
    }
  }

  async getShipmentRates(shipmentId: string): Promise<Rate[]> {
    try {
      const shipment = await this.client.Shipment.retrieve(shipmentId);
      return shipment.rates as Rate[];
    } catch (error) {
      throw new Error(`Failed to get shipment rates: ${error.message}`);
    }
  }

  async regenerateRates(shipmentId: string): Promise<Rate[]> {
    try {
      const shipment = await this.client.Shipment.regenerateRates(shipmentId);
      return shipment.rates as Rate[];
    } catch (error) {
      throw new Error(`Failed to regenerate rates: ${error.message}`);
    }
  }

  async getTrackingInfo(trackingCode: string, carrier?: string): Promise<any> {
    try {
      const trackerData: any = { tracking_code: trackingCode };
      if (carrier) {
        trackerData.carrier = carrier;
      }
      
      const tracker = await this.client.Tracker.create(trackerData);
      return tracker;
    } catch (error) {
      throw new Error(`Failed to get tracking info: ${error.message}`);
    }
  }

  async getAllRatesWithCarriers(
    toAddress: Address,
    fromAddress: Address,
    parcel: Parcel,
    carriers?: string[] // ['USPS', 'UPS', 'FedEx', 'DHL']
  ): Promise<Rate[]> {
    try {
      const shipmentData: any = {
        to_address: {
          ...toAddress,
          name: 'Recipient',
        },
        from_address: {
          ...fromAddress,
          name: 'VMH Office',
        },
        parcel: {
          ...parcel,
          predefined_package: null,
        },
      };

      // Eğer specific carrier'lar belirtildiyse
      if (carriers && carriers.length > 0) {
        shipmentData.options = {
          carrier_accounts: carriers,
        };
      }

      const shipment = await this.client.Shipment.create(shipmentData);

      console.log('Shipment created with carriers:', carriers);
      console.log('Available rates:', shipment.rates?.length);

      // Eğer yeterli rate yoksa, farklı carrier'lar deneyelim
      let allRates = shipment.rates || [];
      
      if (allRates.length < 5) {
        // Tüm major carrier'ları deneyelim
        const majorCarriers = ['USPS', 'UPS', 'FedEx', 'DHL'];
        
        for (const carrier of majorCarriers) {
          try {
            const carrierShipment = await this.client.Shipment.create({
              ...shipmentData,
              options: {
                carrier_accounts: [carrier],
              }
            });
            
            if (carrierShipment.rates) {
              // Duplicate rate'leri önlemek için ID kontrolü
              const newRates = carrierShipment.rates.filter(
                newRate => !allRates.some(existingRate => existingRate.id === newRate.id)
              );
              allRates = [...allRates, ...newRates];
            }
          } catch (carrierError) {
            console.log(`Carrier ${carrier} failed:`, carrierError.message);
          }
        }
      }

      console.log('Total rates collected:', allRates.length);
      return allRates as Rate[];

    } catch (error) {
      console.error('getAllRatesWithCarriers error:', error);
      throw new Error(`Failed to get shipping rates with carriers: ${error.message}`);
    }
  }
}
