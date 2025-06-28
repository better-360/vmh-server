// password-reset/password-reset.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';

@Injectable()
export class EmailVerifyService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // E-posta doğrulama isteği kontrolü
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

  // E-posta doğrulama isteği gönderme
  async requestUserVerification(email: string): Promise<any> {
    try {
      // Validate email parameter
      if (!email || !email.trim()) {
        throw new HttpException(
          'E-posta adresi gereklidir',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Early return: Check if user exists first
      const user = await this.userService.findOne(email);
      if (!user) {
        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Early return: Check if user is already verified
      if (user.emailConfirmed) {
        throw new HttpException(
          'User already verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Early return: Check if verification request already exists
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

      // Log successful verification request
      console.log(`Verification email sent to: ${email}`);

      return {
        message: 'Doğrulama e-postası başarıyla gönderildi',
        status: HttpStatus.OK,
      };

    } catch (error) {
      // Log error for debugging
      console.error('Error in requestUserVerification:', error);

      // Re-throw HttpExceptions as they are
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        'An error occurred while processing the email verification request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Doğrulama kodu geçerliliğini kontrol etme
  async verifyToken(token: string): Promise<string> {
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
  // Doğrulama kodunu silme
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

  // E-posta doğrulama
  async verificationEmail(token: string): Promise<any> {
    if (token.length < 1) {
      throw new HttpException('Geçersiz token', HttpStatus.BAD_REQUEST);
    }
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

  async checkEmailisExist(
    email: string,
  ): Promise<{ exists: boolean; message: string }> {
    const user = await this.userService.findOne(email);
    if (user) {
      return { exists: true, message: 'Email is already registered.' };
    } else {
      return { exists: false, message: 'Email is available.' };
    }
  }
}
