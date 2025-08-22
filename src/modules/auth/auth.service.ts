import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ChangePasswordDto, LoginDto, SetActiveContextDto } from 'src/dtos/user.dto';
import { TokenService } from './token.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private tokenService: TokenService,
    private eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
  ) {
  }


  async signIn(credentials: LoginDto) {
    const user = await this.userService.findUserByEmail(credentials.email);
    console.log('user', user);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    const isPasswordValid = await this.userService.checkPassword(credentials);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Set default context only if user doesn't have one
    await this.setDefaultContextIfNeeded(user);

    const { ...rest } = user;
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    this.eventEmitter.emit(Events.USER_LOGIN, {
      email: user.email,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
    });

    return {
      user: { ...rest },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  private async setDefaultContextIfNeeded(user: any) {
    // Only set context if user doesn't have one
    if (!user.currentWorkspaceId||!user.currentMailboxId && user.workspaces?.length > 0) {
      const firstWorkspaceMember = user.workspaces[0];
      const firstMailbox = firstWorkspaceMember.mailboxes?.[0];
      const defaultContext: SetActiveContextDto = {
        workspaceId: firstWorkspaceMember.workspaceId,
        mailboxId: firstMailbox?.id || null,
      };
      await this.userService.setContext(user.id, defaultContext);
      console.log('current workspace updated');
    }
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
      message: 'Password changed successfully',
    };
    return response;
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

    async validateJwtPayload(payload: any) {
    const user = await this.userService.findUserByEmail(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async verifyJwtPayload(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userService.checkUserByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

}
