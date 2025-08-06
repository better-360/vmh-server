// mail.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Email & Notification System')
@Controller('email')

export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  
}
