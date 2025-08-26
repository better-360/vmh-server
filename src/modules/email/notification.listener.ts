import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { Events } from '../../common/enums/event.enum';
import { Mail, MailActionType } from '@prisma/client';

@Injectable()
export class NotificationListener implements OnModuleInit {
  private logger = new Logger(NotificationListener.name);
  constructor(
    private emailService: EmailService,
  ) {}

  onModuleInit() {
    this.logger.log('Event Listener started');
  }

   @OnEvent(Events.USER_REGISTERED)
   async sendWelcomeMail(payload: { email: string; name: string, password:string }) {
    this.emailService.sendWelcomeMail(payload.email, payload.name,payload.password);
   }

  

  @OnEvent(Events.DOCUMENT_CREATED)
  async sendnewDocumentMail(payload: {
    email: string;
    name: string;
    documentName: string;
  }) {
    this.emailService.sendnewDocumentMail(
      payload.email,
      payload.name,
      payload.documentName,
    );
  }

  @OnEvent(Events.EMAIL_VERIFY_REQUESTED)
  async sendEmailVerifyMail(payload: {
    email: string;
    fullName: string;
    verifyLink: string;
  }) {
    this.logger.log(`Sending email verification to ${payload.email}`);
    this.emailService.sendEmailVerifyMail(
      payload.email,
      payload.fullName,
      payload.verifyLink,
    );
  }

  @OnEvent(Events.PASSWORD_RESET_REQUESTED)
  async sendPasswordResetMail(payload: {
    email: string;
    fullName: string;
    resetLink: string;
  }) {
    this.logger.log(`Sending password reset link to ${payload.email}`);
    this.emailService.sendPasswordResetEmail(
      payload.email,
      payload.fullName,
      payload.resetLink,
    );
  }

  @OnEvent(Events.TICKET_RESOLVED)
  async sendTicketResolvedMail(payload: {
    email: string;
    fullName: string;
    ticket_subject: string;
    ticket_number: string;
  }) {
    this.logger.log(`Sending ticket resolved notification to ${payload.email}`);
    this.emailService.sendTicketResolvedMail(
      payload.email,
      payload.fullName,
      payload.ticket_subject,
      payload.ticket_number,
    );
  }

  @OnEvent(Events.MAIL_ACTION_CREATED)
  async sendMailActionCreatedMail(payload: {
    mail: Mail;
    type: MailActionType;
  }) {
    console.log(`Mail action created: ${payload.mail.id} - ${payload.type}`);
    // Notify handler to send mail to user
  }
}
