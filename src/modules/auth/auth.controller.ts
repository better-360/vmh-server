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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CheckEmailisExistDto, LoginDto, RegisterDto } from 'src/dtos/user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { TokenDto } from 'src/dtos/token.dto';
import { GoogleSignInDto } from 'src/dtos/auth.dto';
import { PasswordResetService } from './reset.service';
import { EmailVerifyService } from './verify.service';
import { TokenService } from './token.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly tokenService: TokenService,
    private readonly emailVerifyService: EmailVerifyService,
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

  @ApiOperation({ summary: 'Kullanıcı kaydı oluşturur' })
  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signUp(@Body() credentials: RegisterDto) {
    return this.authService.signUp({ ...credentials });
  }

  @ApiOperation({ summary: 'Kullanıcı giriş yapar ve token alır' })
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

  @ApiOperation({ summary: 'Refresh token ile yeni erişim tokeni alır' })
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

  @ApiOperation({ summary: 'Google hesabı ile giriş yapar' })
  @Public()
  @Post('sign-in-google')
  @HttpCode(HttpStatus.OK)
  async signInGoogle(@Body() data: GoogleSignInDto) {
    const userData = await this.authService.signInWithGoogle(data.idToken);
    return {
      ...userData,
    };
  }

  @ApiOperation({ summary: 'Şifre sıfırlama talebi gönderir' })
  @Public()
  @Post('request-reset-password')
  requestPasswordReset(@Body() body: { email: string }) {
    return this.passwordResetService.requestPasswordReset(body.email);
  }

  @ApiOperation({ summary: 'Şifre sıfırlama tokenini doğrular' })
  @Public()
  @Post('verify-reset-token')
  async VerifyResetToken(@Body() body: { token: string }) {
    const email = await this.tokenService.verifyPasswordResetToken(body.token);
    return {
      email: email,
      message: 'Token is valid',
    };
  }
  
  @ApiOperation({ summary: 'E posta doğrulama talebi gönderir' })
  @Public()
  @Post('request-email-verify')
  async requestEmailVerify(@Body() body: { email: string }) {
  return await this.emailVerifyService.requestUserVerification(body.email);
  }

  @ApiOperation({ summary: 'Şifre sıfırlama tokenini doğrular' })
  @Public()
  @Post('verify-email-token')
  async verifyEmailToken(@Body() body: { token: string }) {
    return await this.emailVerifyService.verificationEmail(body.token);
  }

  @ApiOperation({ summary: 'Yeni şifre belirleyerek şifre sıfırlama işlemini tamamlar' })
  @Public()
  @Post('reset-password')
  ResetPasswordConfirm(@Body() body: { password: string; token: string }): Promise<void> {
    return this.passwordResetService.resetPassword(body.token, body.password);
  }

  @ApiOperation({ summary: 'Belirtilen e-posta adresinin var olup olmadığını kontrol eder' })
  @Public()
  @Post('check-email')
  async checkEmail(@Body() body: CheckEmailisExistDto) {
    return await this.emailVerifyService.checkEmailisExist(body.email);
  }

  @ApiOperation({ summary: 'Şifre değiştirme' })
  @Post('change-my-password')
  async changePassword(@Req() req:any,@Body() data: ChangePasswordDto) {
    return this.authService.changeUserpassword(req.user.id,data);
  }

}
