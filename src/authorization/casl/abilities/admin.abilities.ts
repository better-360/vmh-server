import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PermissionAction } from '@prisma/client';

/**
 * Admin yetkileri: Admin olan kullanıcılar tüm kaynaklara erişim sahibi olur.
 */

export function defineAdminAbilities({ can }: AbilityBuilder<PureAbility>): void {
  can(PermissionAction.MANAGE, 'all');
}