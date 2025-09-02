import { Mail as PrismaMail, MailType, MailStatus } from '@prisma/client';

export class MailEntity implements PrismaMail {
  id: string;
  steNumber: string;
  mailboxId: string;
  receivedAt: Date;
  trackingNumber: string | null;
  trackingUrl: string | null;
  isShereded: boolean;
  isForwarded: boolean;
  type: MailType;
  status: MailStatus;
  senderName: string | null;
  senderAddress: string | null;
  carrier: string | null;
  width: number | null;
  height: number | null;
  length: number | null;
  weight: number | null;
  volumeDesi: number | null;
  volumeCm3: number | null;
  photoUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  recipientId: string | null;
  isJunked: boolean;
  parentMailId: string | null;
  constructor(partial: Partial<MailEntity>) {
    Object.assign(this, partial);
  }
  isScanned: boolean;
}
