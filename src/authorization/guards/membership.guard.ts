import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { RoleType } from '@prisma/client';

@Injectable()
export class CollaboratorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;

    if(currentUser.roles.some(role => role === RoleType.ADMIN|| role === RoleType.SUPERADMIN)) {
      return true;
    }else if (!currentUser.collabrators || !currentUser.collabrators.some(collabrator => collabrator.id === currentUser.id)) {
      throw new ForbiddenException('You are not a allowed to access this resource');
    }
    return true;
  }
}