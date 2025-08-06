import { Injectable, Inject } from '@nestjs/common';
import { EasyPostClientType } from './easypost.constants';
import { Address, Parcel, PurchaseResult, Rate } from './shipping.interfaces';

@Injectable()
export class EasyPostService {
  constructor(
    @Inject('EASYPOST_CLIENT') private readonly client: EasyPostClientType,
  ) {}

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
    return this.client.Shipment.create(params);
  }

  async track(trackerCode: string) {
    return this.client.Tracker.create({ tracking_code: trackerCode });
  }

   async getAllRates(
    toAddress:   Address,
    fromAddress: Address,
    parcel:      Parcel,
  ): Promise<Rate[]> {
    const shipment = await this.client.Shipment.create({
      to_address:   toAddress,
      from_address: fromAddress,
      parcel:       parcel,
    });

    return shipment.rates as Rate[];
  }

  async purchaseShipment(
    shipmentId: string,
    rateId:     string,
  ): Promise<PurchaseResult> {
    // Shipment’i getir
    const shipment = await this.client.Shipment.retrieve(shipmentId);

    // Label'ı satın al
    const bought: any = await this.client.Shipment.buy(shipmentId, rateId);

    return {
      shipmentId:   bought.id,
      trackingCode: bought.tracking_code,
      labelUrl:     bought.postage_label.label_url,
      carrier:      bought.carrier,
      service:      bought.selected_rate.service,
    };
  }
}
