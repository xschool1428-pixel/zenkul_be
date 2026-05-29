import {
  Role,
  Permission,
  UserRole,
  User,
  UserSchool,
  SubscriptionPlan,
  OrganizationSubscription,
} from '../models/index.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { assertRolePermissionsAllowed } from './organizationEntitlement.service.js';

export async function listPermissions() {
  return Permission.find().sort({ resource: 1, action: 1 });
}

export async function listRoles(filters = {}) {
  const q = { deletedAt: null };
  if (filters.organizationId) q.organizationId = filters.organizationId;
  if (filters.schoolId) q.schoolId = filters.schoolId;
  if (filters.isSystem != null) q.isSystem = filters.isSystem === 'true';
  return Role.find(q);
}

export async function createOrganizationRole({ organizationId, name, code, permissionIds, schoolId }) {
  if (!organizationId) throw new BadRequestError('organizationId required');
  await assertRolePermissionsAllowed(organizationId, permissionIds);

  return Role.create({
    organizationId,
    schoolId: schoolId || null,
    name,
    code,
    scopeLevel: schoolId ? 'school' : 'organization',
    isSystem: false,
    permissions: permissionIds.map((permissionId) => ({ permissionId, effect: 'allow' })),
  });
}

export async function updateOrganizationRole(roleId, organizationId, { name, permissionIds }) {
  const role = await Role.findOne({ _id: roleId, organizationId, isSystem: false });
  if (!role) throw new NotFoundError('Role not found');
  if (permissionIds) {
    await assertRolePermissionsAllowed(organizationId, permissionIds);
    role.permissions = permissionIds.map((permissionId) => ({ permissionId, effect: 'allow' }));
  }
  if (name) role.name = name;
  await role.save();
  return role;
}

export async function assignRole({ userId, roleId, organizationId, schoolId, assignedBy }) {
  const role = await Role.findById(roleId);
  if (!role) throw new NotFoundError('Role not found');

  const orgId = organizationId || role.organizationId;
  if (orgId && role.permissions?.length) {
    const permIds = role.permissions.map((p) => p.permissionId);
    await assertRolePermissionsAllowed(String(orgId), permIds);
  }

  return UserRole.create({
    userId,
    roleId,
    organizationId: organizationId || role.organizationId,
    schoolId: schoolId || role.schoolId,
    assignedBy,
    status: 'active',
  });
}

export async function listUserRoles(userId) {
  return UserRole.find({ userId, status: 'active' }).populate('roleId');
}

export async function listSchoolUsers(schoolId) {
  const memberships = await UserSchool.find({ schoolId, status: 'active' }).populate(
    'userId',
    'firstName lastName email phone status'
  );
  const users = await Promise.all(
    memberships.map(async (m) => {
      const roles = await UserRole.find({ userId: m.userId, schoolId, status: 'active' }).populate(
        'roleId',
        'name code'
      );
      return { user: m.userId, roles };
    })
  );
  return users;
}

export async function listPlans() {
  return SubscriptionPlan.find({ isActive: true });
}

export async function getOrgSubscription(organizationId) {
  return OrganizationSubscription.findOne({ organizationId })
    .populate('planId')
    .sort({ createdAt: -1 });
}
