import { isPlatformSuperAdmin } from '../services/organization.service.js';
import { ForbiddenError } from '../utils/errors.js';

/** Restrict route to global SUPER_ADMIN (not org-scoped admins). */
export async function assertPlatformSuperAdmin(req, res, next) {
  try {
    const allowed = await isPlatformSuperAdmin(req.userId);
    if (!allowed) {
      return next(new ForbiddenError('Platform super admin access required'));
    }
    next();
  } catch (err) {
    next(err);
  }
}
