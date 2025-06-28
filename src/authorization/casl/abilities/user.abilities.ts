import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PermissionAction, WorkspaceRole } from '@prisma/client';
import { UserEntity } from 'src/common/entities/user.entity';
import { PermissionEntity } from 'src/common/entities/permissions.entity';

/**
 * Normal kullanıcı yetkileri: 
 * - Kendi kullanıcı bilgilerine erişim.
 * - Şirkete üyelik durumuna göre ilgili kaynaklarda (ör. DocumentEntity, CompanyEntity, vb.) erişim.
 */
export function defineUserAbilities(
  { can }: AbilityBuilder<PureAbility>,
  user: any,
  workspaceMembership: any[],
): void {
  // Kendi kullanıcı bilgilerine erişim
  can(PermissionAction.READ, UserEntity, { id: user.id });
  can(PermissionAction.UPDATE, UserEntity, { id: user.id });

  // Her bir şirket üyeliği için yetkilendirme
  for (const membership of workspaceMembership) {
    if (membership.role === WorkspaceRole.OWNER) {
      // Owner: Şirkete ait tüm kaynakları yönetebilir.
      can(PermissionAction.MANAGE, PermissionEntity, { companyId: membership.companyId });
    } else if (membership.role === WorkspaceRole.MEMBER) {
      // Officer: Belge ve şirket üyesi işlemlerini yönetir.
      can(PermissionAction.MANAGE, PermissionEntity, { companyId: membership.companyId });
    }
    // DB'den gelen özel izinleri uygula (varsa)
    for (const permission of membership.permission || []) {
      can(
        permission.action,
        permission.subject,
        permission.conditions || { companyId: membership.companyId }
      );
    }
  }
}