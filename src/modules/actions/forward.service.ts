import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { EasyPostService } from "../easypost/easypost.service";
import { ForwardRequestStatus, PaymentStatus, MailActionPriority } from "@prisma/client";
import { CreateForwardingRequestDto } from "../../dtos/forwarding-request.dto";

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  rate: number; // in cents
  currency: string;
  delivery_days?: number;
  delivery_date?: string;
  delivery_date_guaranteed?: boolean;
  est_delivery_days?: number;
  list_rate?: number; // in cents - original price
  retail_rate?: number; // in cents - retail price
  mode?: string;
  billing_type?: string;
  carrier_account_id?: string;
}

export interface ForwardingQuote {
  rates: ShippingRate[];
  deliveryAddress: any;
  mail: any;
  officeLocation: any;
  deliverySpeedOptions: any[];
  packagingTypeOptions: any[];
  shipmentParams: {
    toAddress: any;
    fromAddress: any;
    parcel: any;
  };
  summary: {
    totalRatesFound: number;
    cheapestRate: ShippingRate | null;
    fastestRate: ShippingRate | null;
    availableCarriers: string[];
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface CreateForwardRequestData {
  mailId: string;
  mailboxId: string;
  deliveryAddressId: string;
  deliverySpeedOptionId: string;
  packagingTypeOptionId: string;
  
  // EasyPost seçilen rate bilgileri
  selectedRate: ShippingRate; // Kullanıcının seçtiği EasyPost rate
  
  // Ücret detayları
  deliverySpeedFee?: number; // Delivery speed opsiyonu ücreti
  packagingFee?: number; // Packaging opsiyon ücreti
  serviceFee?: number; // Platform servis ücreti
  
  priority?: MailActionPriority;
}

// Backward compatibility için eski interface
export interface CreateForwardRequestDataLegacy {
  mailId: string;
  mailboxId: string;
  deliveryAddressId: string;
  deliverySpeedOptionId: string;
  packagingTypeOptionId: string;
  carrierId?: string;
  rateId: string;
  shippingCost: number;
  packagingCost: number;
  totalCost: number;
  priority?: MailActionPriority;
}

@Injectable()
export class ForwardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly easyPostService: EasyPostService,
  ) {}

  /**
   * Kullanıcı bir mail seçer ve forward için quote alır
   */
  async getForwardingQuote(mailId: string, deliveryAddressId: string): Promise<ForwardingQuote> {
    // Mail ve ilgili bilgileri getir
    const mail = await this.prisma.mail.findUnique({
      where: { id: mailId },
      include: {
        mailbox: {
          include: {
            officeLocation: true,
          },
        },
      },
    });

    if (!mail) {
      throw new NotFoundException('Mail not found');
    }

    if (!mail.width || !mail.height || !mail.length || !mail.weight) {
      throw new BadRequestException('Mail dimensions are required for shipping quote');
    }

    // Delivery address bilgilerini getir
    const deliveryAddress = await this.prisma.deliveryAddress.findUnique({
      where: { id: deliveryAddressId },
    });

    if (!deliveryAddress) {
      throw new NotFoundException('Delivery address not found');
    }

    // Office location için delivery speed ve packaging options'ları getir
    const [deliverySpeedOptions, packagingTypeOptions] = await Promise.all([
      this.prisma.deliverySpeedPlanMapping.findMany({
        where: { officeLocationId: mail.mailbox.officeLocationId },
        include: { deliverySpeed: true },
      }),
      this.prisma.packagingTypePlanMapping.findMany({
        where: { officeLocationId: mail.mailbox.officeLocationId },
        include: { packagingType: true },
      }),
    ]);

    // EasyPost'tan shipping rates'leri al
    const fromAddress = {
      street1: mail.mailbox.officeLocation.addressLine,
      street2: mail.mailbox.officeLocation.addressLine2 || '',
      city: mail.mailbox.officeLocation.city,
      state: mail.mailbox.officeLocation.state,
      zip: mail.mailbox.officeLocation.zipCode || '',
      country: mail.mailbox.officeLocation.country,
    };

    const toAddress = {
      street1: deliveryAddress.addressLine,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      zip: deliveryAddress.zipCode || '',
      country: deliveryAddress.country,
    };

    const parcel = {
      length: mail.length,
      width: mail.width,
      height: mail.height,
      weight: mail.weight,
    };

    // EasyPost'tan shipment oluştur ve rates al (quote için)
    const easyPostShipment = await this.easyPostService.createShipment({
      to_address: toAddress,
      from_address: fromAddress,
      parcel: parcel,
    });

    console.log('Quote shipment created:', easyPostShipment.id);
    
    const rates: ShippingRate[] = (easyPostShipment.rates || []).map(rate => ({
      id: rate.id,
      carrier: rate.carrier,
      service: rate.service,
      rate: Math.round(parseFloat(rate.rate) * 100), // Convert to cents
      currency: rate.currency || 'USD',
      delivery_days: rate.delivery_days,
      delivery_date: rate.delivery_date,
      delivery_date_guaranteed: rate.delivery_date_guaranteed,
      est_delivery_days: rate.est_delivery_days,
      list_rate: rate.list_rate ? Math.round(parseFloat(rate.list_rate) * 100) : undefined,
      retail_rate: rate.retail_rate ? Math.round(parseFloat(rate.retail_rate) * 100) : undefined,
      mode: rate.mode,
      billing_type: rate.billing_type,
      carrier_account_id: rate.carrier_account_id,
    }));

    // Summary bilgilerini hesapla
    const availableCarriers = [...new Set(rates.map(rate => rate.carrier))];
    const prices = rates.map(rate => rate.rate);
    const cheapestRate = rates.length > 0 ? rates.reduce((prev, current) => 
      prev.rate < current.rate ? prev : current
    ) : null;
    const fastestRate = rates.length > 0 ? rates.reduce((prev, current) => {
      const prevDays = prev.delivery_days || prev.est_delivery_days || 99;
      const currentDays = current.delivery_days || current.est_delivery_days || 99;
      return prevDays < currentDays ? prev : current;
    }) : null;

    return {
      rates,
      deliveryAddress,
      mail,
      officeLocation: mail.mailbox.officeLocation,
      // Shipment parametrelerini sakla (purchase için yeni shipment oluşturmak için)
      shipmentParams: {
        toAddress,
        fromAddress,
        parcel,
      },
      deliverySpeedOptions: deliverySpeedOptions.map(dso => ({
        ...dso.deliverySpeed,
        price: dso.price,
      })),
      packagingTypeOptions: packagingTypeOptions.map(pto => ({
        ...pto.packagingType,
        price: pto.price,
      })),
      summary: {
        totalRatesFound: rates.length,
        cheapestRate,
        fastestRate,
        availableCarriers,
        averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        priceRange: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0,
        },
      },
    };
  }

  /**
   * Kullanıcı onayladıktan sonra ForwardingRequest oluşturur
   */
  async createForwardingRequest(data: CreateForwardRequestData): Promise<any> {
    const mail = await this.prisma.mail.findUnique({
      where: { id: data.mailId },
      include: {
        mailbox: {
          include: {
            officeLocation: true,
          },
        },
      },
    });

    if (!mail) {
      throw new NotFoundException('Mail not found');
    }

    // Delivery address kontrolü
    const deliveryAddress = await this.prisma.deliveryAddress.findUnique({
      where: { id: data.deliveryAddressId },
    });

    if (!deliveryAddress) {
      throw new NotFoundException('Delivery address not found');
    }

    // Delivery speed ve packaging options'ları getir (ücret hesabı için)
    const [deliverySpeedOption, packagingTypeOption] = await Promise.all([
      this.prisma.deliverySpeedPlanMapping.findUnique({
        where: { 
          deliverySpeedId_officeLocationId: {
            deliverySpeedId: data.deliverySpeedOptionId,
            officeLocationId: mail.mailbox.officeLocationId,
          }
        },
        include: { deliverySpeed: true },
      }),
      this.prisma.packagingTypePlanMapping.findUnique({
        where: {
          packagingTypeId_officeLocationId: {
            packagingTypeId: data.packagingTypeOptionId,
            officeLocationId: mail.mailbox.officeLocationId,
          }
        },
        include: { packagingType: true },
      }),
    ]);

    // EasyPost'tan shipment oluştur ve label satın al
    // Country code'u normalize et (EasyPost ISO 2-letter code istiyor)
    const normalizeCountry = (country: string) => {
      if (!country) return 'US';
      const countryUpper = country.toUpperCase();
      if (countryUpper === 'UNITED STATES' || countryUpper === 'USA') return 'US';
      if (countryUpper === 'CANADA') return 'CA';
      if (countryUpper.length === 2) return countryUpper;
      return 'US'; // Default
    };

    const fromAddress = {
      name: 'VMH Office',
      street1: mail.mailbox.officeLocation.addressLine,
      street2: mail.mailbox.officeLocation.addressLine2 || undefined,
      city: mail.mailbox.officeLocation.city,
      state: mail.mailbox.officeLocation.state,
      zip: mail.mailbox.officeLocation.zipCode || '',
      country: normalizeCountry(mail.mailbox.officeLocation.country),
    };

    const toAddress = {
      name: 'Recipient',
      street1: deliveryAddress.addressLine,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      zip: deliveryAddress.zipCode || '',
      country: normalizeCountry(deliveryAddress.country),
    };

    const parcel = {
      length: mail.length || 1, // EasyPost minimum 1 inch gerektirir
      width: mail.width || 1,
      height: mail.height || 1,
      weight: mail.weight || 1, // EasyPost minimum 1 oz gerektirir
    };

    console.log('Creating shipment with data:', {
      fromAddress,
      toAddress,
      parcel,
      selectedRateId: data.selectedRate.id
    });

    // Purchase için yeni shipment oluştur (fiyat garantisi için aynı parametreler)
    let shipment;
    try {
      console.log('Creating fresh shipment for purchase with guaranteed rates...');
      
      shipment = await this.easyPostService.createShipment({
        to_address: toAddress,
        from_address: fromAddress,
        parcel: parcel,
      });
      
      console.log('Fresh shipment created:', shipment.id);
      console.log('Available rates:', shipment.rates?.map(r => ({
        id: r.id,
        carrier: r.carrier,
        service: r.service,
        rate: r.rate
      })));
    } catch (error) {
      console.error('Failed to create fresh shipment:', error);
      throw new BadRequestException(`Failed to create shipment: ${error.message}`);
    }

    // Label satın al (carrier+service match ile fiyat toleransı)
    let purchaseResult;
    try {
      // Carrier ve service ile eşleşen rate'i bul
      const matchingRate = shipment.rates?.find(r => 
        r.carrier === data.selectedRate.carrier && 
        r.service === data.selectedRate.service
      );
      
      if (!matchingRate) {
        console.error('No matching carrier+service found:', {
          selectedCarrier: data.selectedRate.carrier,
          selectedService: data.selectedRate.service,
          availableRates: shipment.rates?.map(r => ({ carrier: r.carrier, service: r.service }))
        });
        throw new BadRequestException('Selected shipping option no longer available. Please get a new quote.');
      }

      // Fiyat toleransı kontrolü (±$5 tolerance)
      const actualPrice = Math.round(parseFloat(matchingRate.rate) * 100);
      const priceDifference = Math.abs(actualPrice - data.selectedRate.rate);
      
      if (priceDifference > 500) { // $5 tolerance
        console.error('Rate price changed significantly:', {
          originalPrice: data.selectedRate.rate,
          currentPrice: actualPrice,
          difference: priceDifference
        });
        throw new BadRequestException(`Shipping price has changed from $${data.selectedRate.rate/100} to $${actualPrice/100}. Please get a new quote.`);
      }

      console.log('Using matching rate:', {
        rateId: matchingRate.id,
        carrier: matchingRate.carrier,
        service: matchingRate.service,
        originalPrice: data.selectedRate.rate/100,
        actualPrice: actualPrice/100,
        difference: (actualPrice - data.selectedRate.rate)/100
      });
      
      purchaseResult = await this.easyPostService.purchaseShipment(
        shipment.id, 
        matchingRate.id
      );
      
      console.log('Label purchased successfully:', purchaseResult.trackingCode);
    } catch (error) {
      console.error('Failed to purchase label:', error);
      throw new BadRequestException(`Label purchase failed: ${error.message}`);
    }

    // Ücret hesaplamaları
    const baseShippingCost = data.selectedRate.rate; // cents cinsinden
    const deliverySpeedFee = data.deliverySpeedFee || deliverySpeedOption?.price || 0;
    const packagingFee = data.packagingFee || packagingTypeOption?.price || 0;
    const serviceFee = data.serviceFee || 0;
    const totalCost = baseShippingCost + deliverySpeedFee + packagingFee + serviceFee;

    // ForwardingRequest kaydet
    const forwardingRequest = await this.prisma.forwardingRequest.create({
      data: {
        mailId: data.mailId,
        mailboxId: data.mailboxId,
        officeLocationId: mail.mailbox.officeLocationId,
        deliveryAddressId: data.deliveryAddressId,
        deliverySpeedOptionId: data.deliverySpeedOptionId,
        packagingTypeOptionId: data.packagingTypeOptionId,
        // EasyPost rate bilgileri
        easypostRateId: data.selectedRate.id,
        easypostShipmentId: purchaseResult.shipmentId,
        selectedCarrier: data.selectedRate.carrier,
        selectedService: data.selectedRate.service,
        
        // Ücret detayları
        baseShippingCost: baseShippingCost,
        deliverySpeedFee: deliverySpeedFee,
        packagingFee: packagingFee,
        serviceFee: serviceFee,
        totalCost: totalCost,
        
        // Backward compatibility
        shippingCost: baseShippingCost,
        packagingCost: packagingFee,
        
        // Rate detayları JSON olarak
        rateDetails: JSON.parse(JSON.stringify(data.selectedRate)),
        
        trackingCode: purchaseResult.trackingCode,
        status: ForwardRequestStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        priority: data.priority || MailActionPriority.STANDARD,
      },
      include: {
        mail: true,
        deliveryAddress: true,
        deliverySpeedOption: true,
        packagingTypeOption: true,      },
    });

    // Mail status'unu güncelle
    await this.prisma.mail.update({
      where: { id: data.mailId },
      data: { isForwarded: true },
    });

    // Kullanıcının bakiyesinden düş (WorkspaceBalance'tan)
    await this.deductFromWorkspaceBalance(data.mailboxId, totalCost);

    return {
      ...forwardingRequest,
      labelUrl: purchaseResult.labelUrl,
      costBreakdown: {
        baseShippingCost,
        deliverySpeedFee,
        packagingFee,
        serviceFee,
        totalCost,
      },
    };
  }

  /**
   * Mail handler'ların forwarding request'leri listelemesi
   */
  async getForwardingRequestsForHandler(officeLocationId: string, status?: ForwardRequestStatus) {
    const where: any = { officeLocationId };
    if (status) {
      where.status = status;
    }

    return this.prisma.forwardingRequest.findMany({
      where,
      include: {
        mail: true,
        deliveryAddress: true,
        deliverySpeedOption: true,
        packagingTypeOption: true,
        carrier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Mail handler request'i completed olarak işaretler
   */
  async completeForwardingRequest(requestId: string): Promise<any> {
    const forwardingRequest = await this.prisma.forwardingRequest.findUnique({
      where: { id: requestId },
    });

    if (!forwardingRequest) {
      throw new NotFoundException('Forwarding request not found');
    }

    if (forwardingRequest.status === ForwardRequestStatus.COMPLETED) {
      throw new BadRequestException('Request is already completed');
    }

    return this.prisma.forwardingRequest.update({
      where: { id: requestId },
      data: {
        status: ForwardRequestStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        mail: true,
        deliveryAddress: true,
        deliverySpeedOption: true,
        packagingTypeOption: true,
        carrier: true,
      },
    });
  }

  /**
   * Forwarding request'i iptal et
   */
  async cancelForwardingRequest(requestId: string): Promise<any> {
    const forwardingRequest = await this.prisma.forwardingRequest.findUnique({
      where: { id: requestId },
    });

    if (!forwardingRequest) {
      throw new NotFoundException('Forwarding request not found');
    }

    if (forwardingRequest.status === ForwardRequestStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed request');
    }

    return this.prisma.forwardingRequest.update({
      where: { id: requestId },
      data: {
        status: ForwardRequestStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        mail: true,
        deliveryAddress: true,
        deliverySpeedOption: true,
        packagingTypeOption: true,
        carrier: true,
      },
    });
  }

  /**
   * Tracking bilgilerini getir
   */
  async trackForwardingRequest(requestId: string): Promise<any> {
    const forwardingRequest = await this.prisma.forwardingRequest.findUnique({
      where: { id: requestId },
      include: {
        mail: true,
        deliveryAddress: true,
        carrier: true,
      },
    });

    if (!forwardingRequest) {
      throw new NotFoundException('Forwarding request not found');
    }

    if (!forwardingRequest.trackingCode) {
      throw new BadRequestException('No tracking code available');
    }

    // EasyPost'tan tracking bilgilerini al
    const trackingInfo = await this.easyPostService.getTrackingInfo(
      forwardingRequest.trackingCode,
      forwardingRequest.carrier?.name
    );

    return {
      forwardingRequest,
      trackingInfo,
    };
  }

  /**
   * Workspace balance'tan ücret düşer
   */
  private async deductFromWorkspaceBalance(mailboxId: string, amount: number): Promise<void> {
    try {
      // Mailbox'ın workspace'ini bul
      const mailbox = await this.prisma.mailbox.findUnique({
        where: { id: mailboxId },
        include: {
          workspace: {
            include: {
              balance: true,
            },
          },
        },
      });

      if (!mailbox || !mailbox.workspace) {
        throw new BadRequestException('Mailbox or workspace not found');
      }

      let workspaceBalance = mailbox.workspace.balance;
      if (!workspaceBalance) {
        // Eğer workspace balance yoksa, oluştur
        console.log(`Creating workspace balance for workspace: ${mailbox.workspace.id}`);
        workspaceBalance = await this.prisma.workspaceBalance.create({
          data: {
            workspaceId: mailbox.workspace.id,
            stripeCustomerId: `cus_temp_${mailbox.workspace.id}`, // Temporary
            currentBalance: 0,
            currentDebt: 0,
            isActive: true,
          },
        });
      }

      // Balance'ı güncelle
      const newBalance = workspaceBalance.currentBalance - amount;
      const newDebt = workspaceBalance.currentDebt + (newBalance < 0 ? Math.abs(newBalance) : 0);

      await this.prisma.workspaceBalance.update({
        where: { id: workspaceBalance.id },
        data: {
          currentBalance: Math.max(newBalance, 0),
          currentDebt: newDebt,
          lastChargedAt: new Date(),
        },
      });

      // Balance transaction kaydı oluştur
      await this.prisma.balanceTransaction.create({
        data: {
          wsbId: workspaceBalance.id,
          amount: amount,
          status: 'SUCCESS',
          attemptedAt: new Date(),
        },
      });

      console.log(`Deducted $${amount/100} from workspace ${mailbox.workspace.id} balance`);
    } catch (error) {
      console.error('Failed to deduct from workspace balance:', error);
      // Balance düşürme başarısız olsa bile forwarding request'i iptal etme
      // Sadece log'la ve devam et - manuel olarak düzeltilebilir
    }
  }

  /**
   * Ücret hesaplama helper method'u
   */
  async calculateForwardingCost(
    selectedRate: ShippingRate,
    deliverySpeedOptionId: string,
    packagingTypeOptionId: string,
    officeLocationId: string,
    serviceFeeOverride?: number
  ): Promise<{
    baseShippingCost: number;
    deliverySpeedFee: number;
    packagingFee: number;
    serviceFee: number;
    totalCost: number;
  }> {
    // Delivery speed ve packaging options'ları getir
    const [deliverySpeedOption, packagingTypeOption] = await Promise.all([
      this.prisma.deliverySpeedPlanMapping.findUnique({
        where: { 
          deliverySpeedId_officeLocationId: {
            deliverySpeedId: deliverySpeedOptionId,
            officeLocationId: officeLocationId,
          }
        },
      }),
      this.prisma.packagingTypePlanMapping.findUnique({
        where: {
          packagingTypeId_officeLocationId: {
            packagingTypeId: packagingTypeOptionId,
            officeLocationId: officeLocationId,
          }
        },
      }),
    ]);

    const baseShippingCost = selectedRate.rate;
    const deliverySpeedFee = deliverySpeedOption?.price || 0;
    const packagingFee = packagingTypeOption?.price || 0;
    const serviceFee = serviceFeeOverride || 0; // Platform servis ücreti
    const totalCost = baseShippingCost + deliverySpeedFee + packagingFee + serviceFee;

    return {
      baseShippingCost,
      deliverySpeedFee,
      packagingFee,
      serviceFee,
      totalCost,
    };
  }
}