import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PermissionAction } from '@prisma/client';
import { MailEntity } from 'src/common/entities/mail.entity';

/**
 * Staff yetkileri: Staff kullanıcılar tüm mail'leri görebilir ve yönetebilir
 */
export function defineStaffAbilities({ can }: AbilityBuilder<PureAbility>): void {
  // Staff tüm mail'leri görebilir ve yönetebilir
  can(PermissionAction.MANAGE, MailEntity);
  
  // Diğer genel yetkiler eklenebilir
  can(PermissionAction.MANAGE, 'all');
}
