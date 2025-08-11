import { Module } from '@nestjs/common';
import { MailActionsService } from './actions.service';
import { MailActionsController } from './actions.controller';

@Module({
  providers: [MailActionsService],
  exports: [MailActionsService],
  controllers: [MailActionsController],
})
export class MailActionsModule {}
