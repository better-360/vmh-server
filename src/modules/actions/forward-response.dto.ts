import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ForwardRequestStatus, PaymentStatus, MailActionPriority } from '@prisma/client';

// =====================
// CUSTOMER RESPONSES (Detaylı)
// =====================

export class CustomerForwardingRequestResponseDto {
  @ApiProperty({ description: 'Forwarding request ID' })
  id: string;

  @ApiProperty({ description: 'Mail ID' })
  mailId: string;

  @ApiProperty({ description: 'Selected carrier' })
  selectedCarrier: string;

  @ApiProperty({ description: 'Selected service' })
  selectedService: string;

  @ApiProperty({ description: 'Tracking code' })
  trackingCode: string;

  @ApiProperty({ description: 'Shipping label URL' })
  labelUrl: string;

  @ApiProperty({ description: 'Request status' })
  status: ForwardRequestStatus;

  @ApiProperty({ description: 'Payment status' })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Cost breakdown' })
  costBreakdown: {
    baseShippingCost: number;
    deliverySpeedFee: number;
    packagingFee: number;
    serviceFee: number;
    totalCost: number;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  // Minimal related data
  @ApiProperty({ description: 'Mail summary' })
  mail: {
    id: string;
    type: string;
    status: string;
    dimensions: {
      width: number;
      height: number;
      length: number;
      weight: number;
    };
  };

  @ApiProperty({ description: 'Delivery address summary' })
  deliveryAddress: {
    id: string;
    label: string;
    recipientName: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// =====================
// HANDLER RESPONSES (Handler ihtiyaçları için optimize)
// =====================

export class HandlerForwardingRequestDto {
  @ApiProperty({ description: 'Forwarding request ID' })
  id: string;

  @ApiProperty({ description: 'Request status' })
  status: ForwardRequestStatus;

  @ApiProperty({ description: 'Priority level' })
  priority: MailActionPriority;

  @ApiProperty({ description: 'Selected carrier' })
  selectedCarrier: string;

  @ApiProperty({ description: 'Selected service' })
  selectedService: string;

  @ApiProperty({ description: 'Tracking code for shipping' })
  trackingCode: string;

  @ApiProperty({ description: 'Shipping label URL for printing' })
  labelUrl: string;

  @ApiProperty({ description: 'Total cost in cents' })
  totalCost: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  completedAt?: string;

  // Handler için gerekli mail bilgileri
  @ApiProperty({ description: 'Mail details for handler' })
  mail: {
    id: string;
    type: string;
    senderName: string;
    dimensions: {
      width: number;
      height: number;
      length: number;
      weight: number;
    };
    photoUrls: string[];
  };

  // Handler için gerekli delivery bilgileri
  @ApiProperty({ description: 'Where to ship the package' })
  deliveryAddress: {
    recipientName: string;
    recipientTelephone: string;
    fullAddress: string; // Combined address string
  };

  // Handler için hız ve paketleme bilgileri
  @ApiProperty({ description: 'Delivery speed requirement' })
  deliverySpeed: {
    title: string;
    description: string;
  };

  @ApiProperty({ description: 'Packaging requirement' })
  packaging: {
    title: string;
    description: string;
  };
}

// =====================
// TRACKING RESPONSES
// =====================

export class TrackingResponseDto {
  @ApiProperty({ description: 'Forwarding request summary' })
  request: {
    id: string;
    trackingCode: string;
    selectedCarrier: string;
    selectedService: string;
    status: ForwardRequestStatus;
    totalCost: number;
  };

  @ApiProperty({ description: 'Real-time tracking information' })
  trackingInfo: {
    status: string;
    statusDetail: string;
    lastUpdate: string;
    estimatedDelivery: string;
    trackingDetails: Array<{
      datetime: string;
      status: string;
      message: string;
      location: string;
    }>;
  };
}
