import {
  OrganizationPermissionGrant,
  Permission,
  SubscriptionPlan,
  OrganizationSubscription,
} from '../models/index.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { assertPermissionIdsExist } from './permissionCatalog.service.js';
import { writeAudit } from './audit.service.js';

export async function listOrganizationGrants(organizationId) {
  return OrganizationPermissionGrant.find({ organizationId })
    .populate('permissionId')
    .sort({ createdAt: -1 });
}

export async function getEntitledPermissionKeys(organizationId) {
  const grants = await OrganizationPermissionGrant.find({ organizationId }).populate('permissionId');
  const now = new Date();
  const keys = grants
    .filter((g) => {
      if (!g.permissionId?.isActive) return false;
      if (g.expiresAt && g.expiresAt < now) return false;
      return true;
    })
    .map((g) => `${g.permissionId.resource}.${g.permissionId.action}`);
  return [...new Set(keys)];
}

export async function getEntitledPermissionIds(organizationId) {
  const grants = await OrganizationPermissionGrant.find({ organizationId });
  const now = new Date();
  return grants
    .filter((g) => !g.expiresAt || g.expiresAt >= now)
    .map((g) => g.permissionId);
}

export async function replaceSuperAdminGrants(organizationId, permissionIds, grantedBy, req) {
  const assignable = await Permission.find({
    _id: { $in: permissionIds },
    isActive: true,
    isPlatformOnly: { $ne: true },
  });
  if (assignable.length !== permissionIds.length) {
    throw new BadRequestError('Cannot grant platform-only or invalid permissions');
  }

  await OrganizationPermissionGrant.deleteMany({ organizationId, source: 'super_admin' });

  if (permissionIds.length) {
    await OrganizationPermissionGrant.insertMany(
      permissionIds.map((permissionId) => ({
        organizationId,
        permissionId,
        source: 'super_admin',
        grantedBy,
      }))
    );
  }

  await writeAudit({
    organizationId,
    actorUserId: grantedBy,
    action: 'permissions_replace',
    entityType: 'organization_permission_grant',
    entityId: organizationId,
    afterState: { permissionIds },
    req,
  });

  return listOrganizationGrants(organizationId);
}

export async function syncGrantsFromPlan(organizationId, planId, grantedBy) {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new NotFoundError('Plan not found');

  await OrganizationPermissionGrant.deleteMany({ organizationId, source: 'plan' });

  const permissionIds = plan.permissionIds || [];
  if (permissionIds.length) {
    await OrganizationPermissionGrant.insertMany(
      permissionIds.map((permissionId) => ({
        organizationId,
        permissionId,
        source: 'plan',
        planId: plan._id,
        grantedBy,
      }))
    );
  }

  return listOrganizationGrants(organizationId);
}

export async function assertRolePermissionsAllowed(organizationId, permissionIds) {
  const entitled = new Set((await getEntitledPermissionIds(organizationId)).map(String));
  const invalid = permissionIds.filter((id) => !entitled.has(String(id)));
  if (invalid.length) {
    throw new BadRequestError(
      'Role includes permissions not entitled for this organization. Contact platform admin.'
    );
  }
}
