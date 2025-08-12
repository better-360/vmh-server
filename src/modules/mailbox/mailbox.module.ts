import { Module } from '@nestjs/common';
import { MailboxService } from './mailbox.service';

@Module({
  providers: [MailboxService],
  exports: [MailboxService],
})
export class MailboxModule {}