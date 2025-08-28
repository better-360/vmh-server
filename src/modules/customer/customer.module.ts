import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { MailboxService } from '../mailbox/mailbox.service';
import { MailService } from '../mail/mail.service';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';
import { MailActionsService } from '../actions/actions.service';
import { TaskService } from '../task/task.service';

@Module({
  controllers: [CustomerController],
  providers: [MailboxService, MailService, CaslAbilityFactory,MailActionsService, TaskService ],
})
export class CustomerModule {}