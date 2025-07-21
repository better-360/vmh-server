import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from 'src/dtos/user.dto';
import { TokenService } from './token.service';
import { OAuth2Client } from 'google-auth-library';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { JwtService } from '@nestjs/jwt';
import { EmailVerifyService } from './verify.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class AuthService {
  private oAuth2Client: OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private tokenService: TokenService,
    private eventEmitter: EventEmitter2,
    private readonly workspaceService: WorkspaceService,
    private readonly jwtService: JwtService,
    private readonly verifyService: EmailVerifyService,
    private readonly billingService: BillingService,
  ) {
    this.oAuth2Client = new OAuth2Client(process.env.WEB_CLIENT_ID);
  }

  // I Will rewrite this method to use the new user creation logic. Don't forget to update the user creation logic in the user service.
  // Create a new user with stripe customerId and workspace, then send a verification email but don't wait verify the user now.
  // Get user basket and workspace information. 
  // Create stripe checkout session for the user.
  // Return user, workspace, tokens and client secret for stripe checkout session.
  // If user already exists, just return the user and workspace information.
  async signUp(credentials: RegisterDto) {
    const { email,addons,planPriceId } = credentials;
    const newUser = await this.userService.createUser(email);
    const newWorkspace = await this.workspaceService.createWorkspace(newUser.id,{ name: newUser.id });
    
    await this.verifyService.requestUserVerification(email);
    const accessToken = this.tokenService.generateAccessToken(newUser);
    const refreshToken = this.tokenService.generateRefreshToken(newUser);
    this.eventEmitter.emit(Events.USER_REGISTERED, {
      email: newUser.email,
      name: newUser.firstName + ' ' + newUser.lastName || 'Customer',
    });
    return {
      user: { ...newUser },
      workspace: { ...newWorkspace },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async signIn(credentials: LoginDto) {
    const user = await this.userService.findUserByEmail(credentials.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await this.userService.checkPassword(credentials);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kullanıcı bilgilerini kopyala
    const { ...rest } = user;
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    // Eğer müşteri kimliği yoksa oluştur
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await this.userService.createStripeCustomerId(user);
    }

    this.eventEmitter.emit(Events.USER_LOGIN, {
      email: user.email,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
    });

    return {
      user: { ...rest, customerStripeID: customerId },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.userService.findUserById(userId);
    if (user) {
      return this.userService.deleteUser(user.email);
    }
  }

  async refreshAccessToken(refreshToken: string) {
    return {
      access_token: this.tokenService.refreshToken(refreshToken),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findUserByEmail(email);
      const isPasswordValid = await this.userService.checkPassword({
        email,
        password,
      });
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async validateJwtPayload(payload: any) {
    const user = await this.userService.findUserByEmail(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async verifyJwtPayload(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token); // Token doğrula
      const user = await this.userService.checkUserByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }


  async changeUserpassword(
    userId: string,
    data: ChangePasswordDto,
  ): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const checkPassword = await this.userService.checkPassword({
      email: user.email,
      password: data.currentPassword,
    });
    if (!checkPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userService.setNewPassword(user.id, data.newPassword);
    const response = {
      message: 'Şifre başarıyla değiştirildi',
    };
    return response;
  }

  async verifyGoogleIDToken(idToken: string) {
    if (!idToken || typeof idToken !== 'string') {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
    try {
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken: idToken,
        audience: process.env.WEB_CLIENT_ID, // Web Client ID
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
  }

  async signInWithGoogle(idToken: string) {
    const payload = await this.verifyGoogleIDToken(idToken);
    if (!payload) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
    const { email } = payload;
    const user = await this.userService.findOne(email);
    if (user) {
      const accessToken = this.tokenService.generateAccessToken(user);
      const refreshToken = this.tokenService.generateRefreshToken(user);
      return {
        user: { ...user },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } else {
      const newUser = await this.userService.createUser(email);
      const accessToken = this.tokenService.generateAccessToken(newUser);
      const refreshToken = this.tokenService.generateRefreshToken(newUser);
      return {
        user: { ...newUser },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    }
  }
}
