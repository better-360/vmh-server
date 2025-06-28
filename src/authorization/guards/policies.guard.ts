import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../casl/ability.factory';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';
import { PolicyHandler } from '../policies/policy-handler.interface';

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
    // If no user or no policy handlers, deny access
    if (!user || policyHandlers.length === 0) {
      return false;
    }

    // Create ability for user
    const ability = await this.caslAbilityFactory.createForUser(user);

    // Check if user satisfies all policy handlers
    
  return policyHandlers.every((handler) => {
    const result = this.execPolicyHandler(handler, ability);
    return result;
  });
  }

  private execPolicyHandler(handler: PolicyHandler, ability: any) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}