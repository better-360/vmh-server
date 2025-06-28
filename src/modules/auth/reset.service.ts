// password-reset/password-reset.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma.service';
import { TokenService } from './token.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.findOne(email);
    const checkResetRequest = await this.checkResetRequest(email);
    if (checkResetRequest) {
      throw new HttpException(
        'Şifre sıfırlama isteği zaten gönderildi',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user) {
      const resetToken = uuidv4();
      const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
      const fullName = user.firstName + ' ' + user.lastName;
      await this.prismaService.token.create({
        data: {
          id: uuidv4(),
          email: email,
          type: 'PASSWORD_RESET',
          token: resetToken,
          expires: moment().add(1, 'hour').toDate(),
        },
      });
      
      // Event emitter ile e-posta gönderme
      this.eventEmitter.emit(Events.PASSWORD_RESET_REQUESTED, {
        email: user.email,
        fullName,
        resetLink,
      });
      
      throw new HttpException('OK', HttpStatus.OK);
    } else {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }
  }

  
  async resetPassword(token: string, newPassword: string): Promise<any> {
    if (token.length < 4) {
      throw new HttpException('Geçersiz token', HttpStatus.BAD_REQUEST);
    }
    if (newPassword.length < 6) {
      throw new HttpException('Geçersiz şifre', HttpStatus.BAD_REQUEST);
    }
    const email = await this.tokenService.verifyPasswordResetToken(token);
    const user = await this.userService.findOne(email);
    if (user) {
      await this.userService.setNewPassword(user.id, newPassword);
      await this.tokenService.deletePasswordResetToken(token);
      const response = {
        message: 'Şifre başarıyla değiştirildi',
      };
      return response;
    } else {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }
  }

  async checkResetRequest(email: string): Promise<boolean> {
    const resetRequest = await this.prismaService.token.findFirst({
      where: {
        email: email,
      },
    });
    if (resetRequest && moment().isBefore(resetRequest.expires)) {
      return true;
    } else {
      return false;
    }
  }
}
