import { ensureSuperAdminUser } from './super-admin/ensureSuperAdmin.js';

/**
 * Runs once after DB connect on every server start.
 * Idempotent: creates SUPER_ADMIN only when no active assignment exists.
 */
export async function runStartupBootstrap() {
  try {
    const result = await ensureSuperAdminUser();
    return { superAdmin: result };
  } catch (err) {
    console.error('[bootstrap] Failed:', err.message);
    throw err;
  }
}
