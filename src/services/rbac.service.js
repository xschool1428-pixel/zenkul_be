import {
  UserRole,
  Role,
  Permission,
  UserSchool,
  OrganizationMember,
  Guardian,
  StudentGuardian,
} from '../models/index.js';
import { isPlatformSuperAdmin } from './organization.service.js';
import { getEntitledPermissionKeys } from './organizationEntitlement.service.js';
import { evaluateOrganizationAccess } from './subscriptionAccess.service.js';

async function filterPermissionsByEntitlement(userId, permissionKeys, organizationId) {
  if (!organizationId) return permissionKeys;
  if (await isPlatformSuperAdmin(userId)) return permissionKeys;

  const entitled = new Set(await getEntitledPermissionKeys(organizationId));
  return permissionKeys.filter((k) => entitled.has(k));
}

export async function getUserPermissions(userId, { schoolId, organizationId } = {}) {
  let userRoles;
  if (schoolId || organizationId) {
    const or = [{ userId, status: 'active', schoolId: null, organizationId: null }];
    if (schoolId) or.push({ userId, status: 'active', schoolId });
    if (organizationId) or.push({ userId, status: 'active', organizationId });
    userRoles = await UserRole.find({ $or: or }).populate('roleId');
  } else {
    userRoles = await UserRole.find({ userId, status: 'active' }).populate('roleId');
  }
  const permissionSet = new Set();

  for (const ur of userRoles) {
    const role = ur.roleId;
    if (!role) continue;
    for (const rp of role.permissions || []) {
      const perm = await Permission.findById(rp.permissionId);
      if (perm && rp.effect !== 'deny' && perm.isActive !== false) {
        permissionSet.add(`${perm.resource}.${perm.action}`);
      }
    }
  }

  let keys = [...permissionSet];
  const orgScope =
    organizationId ||
    (schoolId && userRoles.find((ur) => String(ur.schoolId) === String(schoolId))?.roleId
      ? organizationId
      : null);

  let resolvedOrgId = organizationId;
  if (!resolvedOrgId && schoolId) {
    const { School } = await import('../models/index.js');
    const school = await School.findById(schoolId).select('organizationId');
    resolvedOrgId = school?.organizationId;
  }

  if (resolvedOrgId) {
    keys = await filterPermissionsByEntitlement(userId, keys, String(resolvedOrgId));
  }

  return keys;
}

export async function hasPermission(userId, permissionKey, context = {}) {
  if (await isPlatformSuperAdmin(userId)) return true;

  const perms = await getUserPermissions(userId, context);
  const hasKey = perms.includes(permissionKey);
  const [resource] = permissionKey.split('.');
  const hasManage = perms.includes(`${resource}.manage`);

  if (!hasKey && !hasManage) return false;

  let orgId = context.organizationId;
  if (!orgId && context.schoolId) {
    const { resolveOrganizationIdFromSchool } = await import('./subscriptionAccess.service.js');
    orgId = await resolveOrganizationIdFromSchool(context.schoolId);
  }
  if (orgId) {
    const access = await evaluateOrganizationAccess(orgId);
    if (!access.canUsePortal) return false;
  }

  return true;
}

export async function getAuthContext(userId) {
  const [userRoles, userSchools, orgMembers, guardian] = await Promise.all([
    UserRole.find({ userId, status: 'active' })
      .populate('roleId')
      .populate('schoolId', 'name code organizationId')
      .populate('organizationId', 'name slug'),
    UserSchool.find({ userId, status: 'active' }).populate('schoolId', 'name code organizationId'),
    OrganizationMember.find({ userId, status: 'active' }).populate('organizationId', 'name slug'),
    Guardian.findOne({ userId }),
  ]);

  let children = [];
  if (guardian) {
    const links = await StudentGuardian.find({ guardianId: guardian._id }).populate({
      path: 'studentId',
      select: 'admissionNumber schoolId status',
      populate: { path: 'schoolId', select: 'name code' },
    });
    children = links.map((l) => ({
      studentId: l.studentId?._id,
      admissionNumber: l.studentId?.admissionNumber,
      school: l.studentId?.schoolId,
      relationship: l.relationship,
      isPrimary: l.isPrimary,
    }));
  }

  const roles = userRoles.map((ur) => ({
    roleCode: ur.roleId?.code,
    roleName: ur.roleId?.name,
    scopeLevel: ur.roleId?.scopeLevel,
    schoolId: ur.schoolId?._id || ur.schoolId,
    organizationId: ur.organizationId?._id || ur.organizationId,
    abacScope: ur.abacScope,
  }));

  const permissions = await getUserPermissions(userId);

  let subscription = null;
  const primaryOrgId = orgMembers[0]?.organizationId?._id || orgMembers[0]?.organizationId;
  if (primaryOrgId) {
    subscription = await evaluateOrganizationAccess(String(primaryOrgId));
  } else if (await isPlatformSuperAdmin(userId)) {
    subscription = { access: 'full', phase: 'platform', canUsePortal: true };
  }

  let entitledPermissions = [];
  if (primaryOrgId) {
    entitledPermissions = await getEntitledPermissionKeys(String(primaryOrgId));
  }

  return {
    roles,
    permissions,
    entitledPermissions,
    subscription,
    schools: userSchools.map((us) => us.schoolId),
    organizations: orgMembers.map((om) => om.organizationId),
    guardian: guardian
      ? { id: guardian._id, firstName: guardian.firstName, lastName: guardian.lastName }
      : null,
    children,
    isParent: Boolean(guardian && children.length > 0),
  };
}

export async function getParentStudentIds(userId) {
  const guardian = await Guardian.findOne({ userId });
  if (!guardian) return [];
  const links = await StudentGuardian.find({ guardianId: guardian._id });
  return links.map((l) => l.studentId.toString());
}

export async function assertParentCanAccessStudent(userId, studentId) {
  const allowed = await getParentStudentIds(userId);
  if (!allowed.includes(studentId.toString())) {
    const { ForbiddenError } = await import('../utils/errors.js');
    throw new ForbiddenError('Not linked to this student');
  }
}
