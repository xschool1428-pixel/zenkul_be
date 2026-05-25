/**
 * SUPER_ADMIN credentials from environment.
 * Set in .env — never commit real production passwords.
 */
export function getSuperAdminConfig() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const autoBootstrap = process.env.SUPER_ADMIN_AUTO_BOOTSTRAP !== 'false';

  return {
    enabled: autoBootstrap,
    email,
    password,
    firstName: process.env.SUPER_ADMIN_FIRST_NAME?.trim() || 'Super',
    lastName: process.env.SUPER_ADMIN_LAST_NAME?.trim() || 'Admin',
    phone: process.env.SUPER_ADMIN_PHONE?.trim() || undefined,
  };
}

export function validateSuperAdminConfig(config) {
  if (!config.enabled) {
    return { ok: false, reason: 'disabled' };
  }
  if (!config.email) {
    return { ok: false, reason: 'SUPER_ADMIN_EMAIL is not set' };
  }
  if (!config.password || config.password.length < 8) {
    return { ok: false, reason: 'SUPER_ADMIN_PASSWORD must be at least 8 characters' };
  }
  return { ok: true };
}
