import { hasPermission } from '../services/rbac.service.js';
import { ForbiddenError } from '../utils/errors.js';

export function authorize(permissionKey) {
  return async (req, res, next) => {
    try {
      const context = {
        schoolId: req.schoolId,
        organizationId: req.organizationId,
      };
      const allowed = await hasPermission(req.userId, permissionKey, context);
      if (!allowed) {
        throw new ForbiddenError(`Missing permission: ${permissionKey}`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
