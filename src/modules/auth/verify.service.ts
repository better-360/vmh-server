// password-reset/password-reset.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class EmailVerifyService {
  private oAuth2Client: OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
  this.oAuth2Client = new OAuth2Client(process.env.WEB_CLIENT_ID);
  }

 
  async checkVerifyRequestExist(email: string): Promise<any> {
    const verifyRequest = await this.prismaService.token.findFirst({
      where: {
        email: email,
      },
    });
    if (verifyRequest && moment().isBefore(verifyRequest.expires)) {
      return true;
    } else {
      return false;
    }
  }

  async requestUserVerification(email: string): Promise<any> {
    try {
      // Validate email parameter
      if (!email || !email.trim()) {
        throw new HttpException(
          'E-posta adresi gereklidir',
          HttpStatus.BAD_REQUEST,
        );
      }

      //Check if user exists first
      const user = await this.userService.findOne(email);
      if (!user) {
        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND,
        );
      }

      //Check if user is already verified
      if (user.emailConfirmed) {
        throw new HttpException(
          'User already verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if verification request already exists
      const existingVerifyRequest = await this.checkVerifyRequestExist(email);
      if (existingVerifyRequest) {
        throw new HttpException(
          'Email verification request already sent. Please wait a few minutes and try again.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Generate verification token and link
      const verifyToken = uuidv4();
      const verifyLink = `${process.env.APP_URL}/verify-email?token=${verifyToken}`;
      const fullName = `${user.firstName} ${user.lastName || ''}`.trim();

      // Create verification token in database
      await this.prismaService.token.create({
        data: {
          id: uuidv4(),
          email: email.toLowerCase(),
          token: verifyToken,
          type: 'EMAIL_VERIFICATION',
          expires: moment().add(1, 'day').toDate(),
        },
      });

      // Emit email verification event
      this.eventEmitter.emit(Events.EMAIL_VERIFY_REQUESTED, {
        email: user.email,
        fullName,
        verifyLink,
      });
      
      return {
        message: 'Email verification request sent successfully. Please check your inbox.',
        status: HttpStatus.OK,
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'An error occurred while processing the email verification request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyToken(token: string): Promise<string> {
    if (token.length < 4) {
      throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
    }
    const verificationToken = await this.prismaService.token.findFirst({
      where: {
        token: token,
      },
    });

    if (!verificationToken || moment().isAfter(verificationToken.expires)) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }
    return verificationToken.email;
  }

  async deleteVerifyToken(token: string): Promise<void> {
    const resetToken = await this.prismaService.token.findFirst({
      where: {
        token: token,
      },
    });

    if (resetToken) {
      await this.prismaService.token.delete({
        where: {
          id: resetToken.id,
        },
      });
    }
  }


  async verifyEmailToken(token: string): Promise<any> {
    const tokenEmail = await this.verifyToken(token);
    if (tokenEmail) {
      await this.userService.verifyUserEmail(tokenEmail);
      await this.deleteVerifyToken(token);
      return {
        message: 'Email verified successfully',
        status: HttpStatus.OK,
      };
    } else {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }


   async verifyGoogleIDToken(idToken: string) {
    if (!idToken || typeof idToken !== 'string') {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
    try {
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken: idToken,
        audience: process.env.WEB_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
  }
  
}
