import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../casl/ability.factory';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';
import { PolicyHandler } from '../policies/policy-handler.interface';
import { ResourceAccessDeniedException } from '../../common/exceptions/auth.exceptions';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    
    // If no policy handlers, allow access
    if (policyHandlers.length === 0) {
      return true;
    }
    
    // If no user, this should be caught by JWT guard first
    if (!user) {
      throw new ResourceAccessDeniedException('policy validation');
    }

    // Create ability for user
    const ability = await this.caslAbilityFactory.createForUser(user);

    // Check if user satisfies all policy handlers
    const hasAccess = policyHandlers.every((handler) => {
      const result = this.execPolicyHandler(handler, ability);
      return result;
    });

    if (!hasAccess) {
      throw new ResourceAccessDeniedException('policy requirements');
    }

    return true;
  }

  private execPolicyHandler(handler: PolicyHandler, ability: any) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}