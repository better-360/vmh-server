import { 
  Controller, 
  Post, 
  Body, 
  HttpStatus, 
  HttpCode, 
  UsePipes, 
  ValidationPipe, 
  Req,
  Get,
  Query,
  Res,
  Patch,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CheckEmailisExistDto, LoginDto, SetActiveContextDto } from 'src/dtos/user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { TokenDto } from 'src/dtos/token.dto';
import { PasswordResetService } from './reset.service';
import { EmailVerifyService } from './verify.service';
import { TokenService } from './token.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { CurrentUser } from 'src/common/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly tokenService: TokenService,
    private readonly emailVerifyService: EmailVerifyService,
    private readonly userService: UserService,
  ) {}
  

  @Public()
  @Get('redirect-link')
  async authRedirect(@Query('redirect') redirect: string, @Req() req: any, @Res() res: any) {
    const user = req.user;
    const redirectPath = redirect.startsWith('/') ? redirect : `/${redirect}`;
    if (user) {
      console.log('redirectPath',redirectPath);
      return res.redirect(redirectPath);
    } else {
      console.log('redirectPath',`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return res.redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }

  }


  @ApiOperation({ summary: 'Sign in' })
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signIn(@Body() credentials: LoginDto) {
    const userData = await this.authService.signIn({ ...credentials });
    return {
      ...userData,
    };
  }

  @ApiOperation({ summary: 'Set Context' })
  @Put('set-context')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async setContext(@Body() contextData: SetActiveContextDto, @CurrentUser('id') userId: string) {
    return await this.userService.setContext(userId, contextData);
  }

  @ApiOperation({ summary: 'Get Context' })
  @Get('get-context')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async getContext(@CurrentUser('id') userId: string) {
    return await this.userService.getContext(userId);
  }


  @ApiOperation({ summary: 'Generate new acces token with using refresh token' })
  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() data: TokenDto) {
    const newAccessToken = await this.authService.refreshAccessToken(
      data.refreshToken,
    );
    return {
      ...newAccessToken,
      message: 'Token refreshed',
      code: HttpStatus.OK,
    };
  }


  @ApiOperation({ summary: 'Create pasword reset request' })
  @Public()
  @Post('request-reset-password')
  requestPasswordReset(@Body() body: { email: string }) {
    return this.passwordResetService.requestPasswordReset(body.email);
  }

  @ApiOperation({ summary: 'Verify password reset token' })
  @Public()
  @Post('verify-reset-token')
  async VerifyResetToken(@Body() body: { token: string }) {
    const email = await this.tokenService.verifyPasswordResetToken(body.token);
    return {
      email: email,
      message: 'Token is valid',
    };
  }
  
  @ApiOperation({ summary: 'Create email verify request' })
  @Public()
  @Post('request-email-verify')
  async requestEmailVerify(@Body() body: { email: string }) {
  return await this.emailVerifyService.requestUserVerification(body.email);
  }

  @ApiOperation({ summary: 'Verify email  verify token' })
  @Public()
  @Post('verify-email-token')
  async verifyEmailToken(@Body() body: { token: string }) {
    return await this.emailVerifyService.verifyEmailToken(body.token);
  }

  @ApiOperation({ summary: 'Completes the password reset process by setting a new password.' })
  @Public()
  @Post('reset-password')
  ResetPasswordConfirm(@Body() body: { password: string; token: string }): Promise<void> {
    return this.passwordResetService.resetPassword(body.token, body.password);
  }

  @ApiOperation({ summary: 'Checks email address exists' })
  @Public()
  @Post('check-email')
  async checkEmail(@Body() body: CheckEmailisExistDto) {
    return await this.authService.checkEmailisExist(body.email);
  }

  @ApiOperation({ summary: 'Change Password' })
  @Post('change-my-password')
  async changePassword(@CurrentUser('id') userId: string, @Body() data: ChangePasswordDto) {
    return this.authService.changeUserpassword(userId,data);
  }

}
