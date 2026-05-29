import { ensureSuperAdminUser } from './super-admin/ensureSuperAdmin.js';
import { ensureBillingDefaults } from './billingBootstrap.js';

/**
 * Runs once after DB connect on every server start.
 * Idempotent: creates SUPER_ADMIN only when no active assignment exists.
 */
export async function runStartupBootstrap() {
  try {
    const [superAdmin, billing] = await Promise.all([
      ensureSuperAdminUser(),
      ensureBillingDefaults(),
    ]);
    return { superAdmin, billing };
  } catch (err) {
    console.error('[bootstrap] Failed:', err.message);
    throw err;
  }
}
