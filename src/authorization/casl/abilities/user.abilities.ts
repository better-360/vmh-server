import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PermissionAction, WorkspaceRole } from '@prisma/client';
import { UserEntity } from 'src/common/entities/user.entity';
import { PermissionEntity } from 'src/common/entities/permissions.entity';
import { MailEntity } from 'src/common/entities/mail.entity';

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

  // Her bir workspace üyeliği için yetkilendirme
  for (const membership of workspaceMembership) {
    const workspaceId = membership.workspaceId;
    
    if (membership.role === WorkspaceRole.OWNER) {
      // Owner: Workspace'e ait tüm kaynakları yönetebilir.
      can(PermissionAction.MANAGE, PermissionEntity, { workspaceId });
      
      // Owner tüm mailbox'lara erişebilir
      can(PermissionAction.READ, MailEntity);
      can(PermissionAction.UPDATE, MailEntity);
    } else if (membership.role === WorkspaceRole.MEMBER) {
      // Member: Workspace kaynaklarına sınırlı erişim
      can(PermissionAction.READ, PermissionEntity, { workspaceId });
      
      // Member sadece okuma yapabilir
      can(PermissionAction.READ, MailEntity);
    }
    
    // DB'den gelen özel izinleri uygula (varsa)
    for (const permission of membership.permission || []) {
      can(
        permission.action,
        permission.subject,
        permission.conditions || { workspaceId }
      );
    }
  }
}