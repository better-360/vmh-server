import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NotificationListener } from './notification.listener';
import { EmailController } from './email.controller';

@Global()
@Module({
  providers: [EmailService,NotificationListener],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
