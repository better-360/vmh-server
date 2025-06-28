import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './../auth.service';
import { IUser } from 'src/common/interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<IUser> {
    const user = await this.authService.validateJwtPayload(payload.email);
    if (!user) {
       throw new HttpException(
        'Forbidden',
        HttpStatus.FORBIDDEN,
      );
    }
    return user;
  }
}