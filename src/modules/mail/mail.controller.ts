// mail.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Mail & Notification System')
@Controller('mail')

export class MailController {
  constructor(private readonly mailService: MailService) {}
  
}
