import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PermissionAction } from '@prisma/client';
import { MailEntity } from 'src/common/entities/mail.entity';

/**
 * Admin yetkileri: Admin olan kullanıcılar tüm kaynaklara erişim sahibi olur.
 */

export function defineAdminAbilities({ can }: AbilityBuilder<PureAbility>): void {
  // Admin tüm kaynaklara erişebilir
  can(PermissionAction.MANAGE, 'all');
  
  // Özellikle mail'ler için explicit permission
  can(PermissionAction.MANAGE, MailEntity);
}