import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './../auth.service';
import { IUser } from 'src/common/interfaces/user.interface';
import { TokenInvalidException } from 'src/common/exceptions/auth.exceptions';

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
    try {
      const user = await this.authService.validateJwtPayload(payload.email);
      if (!user) {
        throw new TokenInvalidException('User not found or token payload invalid');
      }
      return user;
    } catch (error) {
      if (error instanceof TokenInvalidException) {
        throw error;
      }
      throw new TokenInvalidException('Token validation failed');
    }
  }
}