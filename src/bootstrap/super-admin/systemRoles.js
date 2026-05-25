import { Permission, Role } from '../../models/index.js';
import { SYSTEM_PERMISSIONS, superAdminRolePermissions } from '../constants/systemPermissions.js';

const SUPER_ADMIN_CODE = 'SUPER_ADMIN';

export async function ensureSuperAdminRole() {
  for (const p of SYSTEM_PERMISSIONS) {
    await Permission.findOneAndUpdate(
      { resource: p.resource, action: p.action },
      { ...p, isSystem: true },
      { upsert: true }
    );
  }

  const perms = await Permission.find();
  const permMap = Object.fromEntries(perms.map((p) => [`${p.resource}.${p.action}`, p._id]));

  const role = await Role.findOneAndUpdate(
    { code: SUPER_ADMIN_CODE, organizationId: null, schoolId: null },
    {
      code: SUPER_ADMIN_CODE,
      name: 'Super Admin',
      scopeLevel: 'organization',
      isSystem: true,
      permissions: superAdminRolePermissions(permMap),
    },
    { upsert: true, new: true }
  );

  return role;
}

export { SUPER_ADMIN_CODE };
