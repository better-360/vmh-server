import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ContextDto } from 'src/dtos/user.dto';

export const Context = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ContextDto => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    // Check if user has context information
    if (!user.currentWorkspaceId||!user.currentMailboxId) {
      throw new BadRequestException('User context not set. Please set your active workspace first.');
    }

    return {
      workspaceId: user.currentWorkspaceId,
      mailboxId: user.currentMailboxId || undefined,
    };
  },
);
