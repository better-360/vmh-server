import { Module } from '@nestjs/common';
import { MailboxService } from './mailbox.service';
import { MailboxController } from './mailbox.controller';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';

@Module({
  providers: [MailboxService, CaslAbilityFactory],
  exports: [MailboxService],
  controllers: [MailboxController],
})
export class MailboxModule {}