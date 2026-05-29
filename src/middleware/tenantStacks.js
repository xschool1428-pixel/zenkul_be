import { authenticate } from './auth.js';
import {
  requireSchoolContext,
  assertSchoolAccess,
  requireOrganizationContext,
  assertOrganizationAccess,
} from './tenant.js';
import { requireOrganizationSubscription } from './requireOrganizationSubscription.js';

/** Standard chain for school-scoped APIs */
export const schoolApiStack = [
  authenticate,
  requireSchoolContext,
  assertSchoolAccess,
  requireOrganizationSubscription,
];

/** Standard chain for organization-scoped admin APIs */
export const orgApiStack = [
  authenticate,
  requireOrganizationContext,
  assertOrganizationAccess,
  requireOrganizationSubscription,
];
