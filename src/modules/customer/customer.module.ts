import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { MailboxService } from '../mailbox/mailbox.service';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [CustomerController],
  providers: [MailboxService,MailService],
})
export class CustomerModule {}