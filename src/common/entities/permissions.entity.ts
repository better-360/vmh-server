// src/common/entities/permissions.entity.ts
import {
  Permission as PrismaPermission,
  PermissionAction,
} from '@prisma/client';

export class PermissionEntity implements PrismaPermission {
  id: string;
  companyUserId: string;
  action: PermissionAction;
  subject: string;
  conditions: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PermissionEntity>) {
    Object.assign(this, partial);
  }
}
