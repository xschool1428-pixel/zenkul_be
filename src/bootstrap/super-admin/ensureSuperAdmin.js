import { User, UserRole } from '../../models/index.js';
import { getSuperAdminConfig, validateSuperAdminConfig } from './config.js';
import { ensureSuperAdminRole, SUPER_ADMIN_CODE } from './systemRoles.js';

async function findActiveSuperAdminAssignment(superAdminRoleId) {
  return UserRole.findOne({
    roleId: superAdminRoleId,
    status: 'active',
    organizationId: null,
    schoolId: null,
  }).populate('userId', 'email firstName lastName status');
}

async function assignSuperAdminRole(userId, roleId) {
  return UserRole.findOneAndUpdate(
    {
      userId,
      roleId,
      organizationId: null,
      schoolId: null,
    },
    {
      userId,
      roleId,
      organizationId: null,
      schoolId: null,
      status: 'active',
      assignedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

/**
 * On every server start: ensure SUPER_ADMIN role exists and exactly one
 * platform super-admin user is bootstrapped from env credentials when missing.
 */
export async function ensureSuperAdminUser() {
  const config = getSuperAdminConfig();
  const superAdminRole = await ensureSuperAdminRole();

  const existing = await findActiveSuperAdminAssignment(superAdminRole._id);
  if (existing?.userId) {
    console.log(
      `[bootstrap] SUPER_ADMIN already exists (${existing.userId.email}) — skipped`
    );
    return { created: false, email: existing.userId.email };
  }

  const validation = validateSuperAdminConfig(config);
  if (!validation.ok) {
    console.warn(
      `[bootstrap] SUPER_ADMIN not created: ${validation.reason}. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env`
    );
    return { created: false, reason: validation.reason };
  }

  let user = await User.findOne({ email: config.email, deletedAt: null });

  if (!user) {
    const passwordHash = await User.hashPassword(config.password);
    user = await User.create({
      email: config.email,
      passwordHash,
      firstName: config.firstName,
      lastName: config.lastName,
      phone: config.phone,
      status: 'active',
    });
    console.log(`[bootstrap] Created SUPER_ADMIN user: ${config.email}`);
  } else {
    console.log(`[bootstrap] Using existing user for SUPER_ADMIN: ${config.email}`);
  }

  await assignSuperAdminRole(user._id, superAdminRole._id);

  console.log(`[bootstrap] Assigned ${SUPER_ADMIN_CODE} role to ${config.email}`);
  return { created: true, email: config.email };
}
