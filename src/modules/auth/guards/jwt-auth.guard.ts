import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { Observable } from 'rxjs';
import { RoleType } from '@prisma/client';
import { 
  TokenMissingException, 
  TokenInvalidException, 
  InsufficientPermissionsException 
} from '../../../common/exceptions/auth.exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Public endpoint'lerde bile token'ı kontrol etmek için devam ediyoruz
      return this.handleOptionalToken(context);
    }

    // Token varlığını önce kontrol et
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new TokenMissingException();
    }

    const result = super.canActivate(context);
    const resultAsPromise =
      result instanceof Promise ? result : Promise.resolve(result);

    return resultAsPromise.then((authorized) => {
      if (!authorized) {
        throw new TokenInvalidException();
      }

      const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        return true;
      }

      const user = request.user;

      if (
        !user ||
        !user.roles ||
        !requiredRoles.some((role) => user.roles.includes(role))
      ) {
        throw new InsufficientPermissionsException(requiredRoles);
      }

      return true;
    }).catch((error) => {
      // JWT Strategy'den gelen hataları yakala ve uygun exception'a dönüştür
      if (error instanceof TokenMissingException || 
          error instanceof TokenInvalidException || 
          error instanceof InsufficientPermissionsException) {
        throw error;
      }
      
      // Passport JWT hatalarını token invalid olarak ele al
      throw new TokenInvalidException('Token validation failed');
    });
  }

  // Eğer public endpoint ise ve token varsa, onu parse etmeye çalışıyoruz
  async handleOptionalToken(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // JWT strategy'yi çalıştırarak user'ı validate et
        const result = await super.canActivate(context);
        // JWT strategy başarılıysa user zaten request'e set edilmiş olur
      } catch (error) {
        console.warn('Optional JWT Token validation failed', error.message);
        request.user = null; // Token varsa ama geçersizse user null olsun
      }
    } else {
      request.user = null; // Token yoksa user null
    }

    return true; // Public endpoint olduğu için her halükarda erişime izin ver
  }

  handleRequest(err, user, info, context) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Public endpoint ise, user null olabilir ama hata atmamalıyız
      return user || null;
    }

    if (err) {
      // Strategy'den gelen hataları olduğu gibi fırlat
      throw err;
    }

    if (!user) {
      // Bu durumda token var ama geçersiz (strategy validate'den geçememiş)
      throw new TokenInvalidException();
    }

    return user;
  }
}
