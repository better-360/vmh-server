// src/authorization/casl/ability.factory.ts
import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
  mongoQueryMatcher,
} from '@casl/ability';
import { User } from '@prisma/client';
import { PermissionAction } from '@prisma/client';
import { UserEntity } from 'src/common/entities/user.entity';
import { PermissionEntity } from 'src/common/entities/permissions.entity';
import { MailEntity } from 'src/common/entities/mail.entity';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'src/common/enums/role.enum';
import { defineAdminAbilities } from './abilities/admin.abilities';
import { defineUserAbilities } from './abilities/user.abilities';
import { defineStaffAbilities } from './abilities/staff.abilities';
import { defineSuperAdminAbilities } from './abilities/superadmin.abilities.';

// Define subjects that permissions can target
export type Subjects = InferSubjects<typeof UserEntity | typeof PermissionEntity | typeof MailEntity | 'all'>;

// Define AppAbility type
export type AppAbility = PureAbility<[PermissionAction, Subjects]>;

// Define CaslAbilityFactory
@Injectable()
export class CaslAbilityFactory {
  constructor(private prismaService: PrismaService) {}

  async createForUser(user: any): Promise<AppAbility> {    
    // JWT'deki user objesi zaten tüm bilgilere sahip
    let userRoles: string[] = [];
    let workspaceMemberships: any[] = [];

    if (user.roles) {
      // JWT'den roller
      userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    } else {
      // Fallback: database'den çek
      const userWithRoles = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: { roles: true },
      });
      userRoles = userWithRoles?.roles?.map((ur) => ur.role) || [];
    }

    if (user.workspaces) {
      // JWT'den workspace bilgileri
      workspaceMemberships = user.workspaces;
    } else {
      // Fallback: database'den çek
      const userWithWorkspaces = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          workspaces: {
            include: {
              workspace: {
                include: {
                  mailboxes: {
                    where: { isActive: true },
                    select: { id: true, steNumber: true }
                  }
                }
              }
            }
          }
        },
      });
      workspaceMemberships = userWithWorkspaces?.workspaces || [];
    }


    console.log('CASL - userRoles:', userRoles);
    console.log('CASL - workspaceMemberships:', JSON.stringify(workspaceMemberships, null, 2));

    const abilityBuilder = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    const { can, cannot, build } = abilityBuilder;

    if (userRoles.includes('SUPERADMIN')) {
      console.log('🔍 CASL - Using SUPERADMIN abilities');
      defineSuperAdminAbilities(abilityBuilder);
    } else if (userRoles.includes('ADMIN')) {
      console.log('🔍 CASL - Using ADMIN abilities');
      defineAdminAbilities(abilityBuilder);
    } else if (userRoles.includes('STAFF')) {
      console.log('🔍 CASL - Using STAFF abilities');
      defineStaffAbilities(abilityBuilder);
    } else if (userRoles.includes('CUSTOMER')) {
      console.log('🔍 CASL - Using CUSTOMER abilities');
      defineUserAbilities(abilityBuilder, user, workspaceMemberships);
    } else {
      console.log('⚠️ CASL - No matching role found for user, roles:', userRoles);
    }

    const ability = build({
      detectSubjectType: (item) => {

        return item.constructor as ExtractSubjectType<Subjects>;
      },
      resolveAction: (action) => {
        if (action === PermissionAction.MANAGE) {
          return [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
          ];
        }
        return action;
      },
      conditionsMatcher: mongoQueryMatcher,
    });
    return ability;
  }
}
