import { Global, Module } from '@nestjs/common';
import { MailActionsService } from './actions.service';
import { MailActionsController } from '../handler/actions.controller';

@Global()
@Module({
  providers: [MailActionsService],
  exports: [MailActionsService],
  controllers: [MailActionsController],
})
export class MailActionsModule {}
