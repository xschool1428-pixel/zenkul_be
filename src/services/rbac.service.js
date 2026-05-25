import {
  UserRole,
  Role,
  Permission,
  UserSchool,
  OrganizationMember,
  Guardian,
  StudentGuardian,
} from '../models/index.js';

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
      if (perm && rp.effect !== 'deny') {
        permissionSet.add(`${perm.resource}.${perm.action}`);
      }
    }
  }

  return [...permissionSet];
}

export async function hasPermission(userId, permissionKey, context = {}) {
  const perms = await getUserPermissions(userId, context);
  if (perms.includes(permissionKey)) return true;
  const [resource] = permissionKey.split('.');
  return perms.includes(`${resource}.manage`);
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

  return {
    roles,
    permissions,
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
