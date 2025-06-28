import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NotificationListener } from './notification.listener';
import { MailController } from './mail.controller';

@Global()
@Module({
  providers: [MailService,NotificationListener],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
