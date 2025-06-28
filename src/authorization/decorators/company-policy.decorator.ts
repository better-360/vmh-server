// src/authorization/decorators/company-policy.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '@prisma/client';
import { Subjects } from '../casl/ability.factory';

export const COMPANY_POLICY_KEY = 'company_policy';

export interface CompanyPolicyHandler {
  action: PermissionAction;
  subject: Subjects;
}

export const CheckCompanyPolicy = (action: PermissionAction, subject: any) =>
  SetMetadata(COMPANY_POLICY_KEY, { action, subject });