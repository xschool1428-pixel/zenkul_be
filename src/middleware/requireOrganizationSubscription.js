import { isPlatformSuperAdmin } from '../services/organization.service.js';
import {
  assertOrganizationPortalAccess,
  resolveOrganizationIdFromSchool,
} from '../services/subscriptionAccess.service.js';

const BILLING_PATH_PREFIXES = [
  '/auth',
  '/payments/platform',
  '/admin/organizations/subscription',
  '/admin/organizations/billing',
];

function isBillingExempt(req) {
  const path = req.originalUrl || req.url || '';
  return BILLING_PATH_PREFIXES.some((p) => path.includes(p));
}

/**
 * Blocks org/school API usage when subscription is suspended (after grace period).
 * Super Admin bypasses. Payment and billing summary routes stay open.
 */
export async function requireOrganizationSubscription(req, res, next) {
  try {
    if (isBillingExempt(req)) return next();
    if (await isPlatformSuperAdmin(req.userId)) return next();

    let organizationId = req.organizationId;
    if (!organizationId && req.schoolId) {
      organizationId = await resolveOrganizationIdFromSchool(req.schoolId);
    }

    if (!organizationId) return next();

    const snapshot = await assertOrganizationPortalAccess(organizationId, req.userId);
    req.subscriptionAccess = snapshot;
    next();
  } catch (err) {
    next(err);
  }
}
