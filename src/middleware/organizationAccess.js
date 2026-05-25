import { Organization, OrganizationMember } from '../models/index.js';
import { hasPermission } from '../services/rbac.service.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export async function assertOrganizationReadAccess(req, res, next) {
  try {
    const organizationId = req.params.id || req.params.organizationId || req.organizationId;
    if (!organizationId) {
      return next(new ForbiddenError('Organization context required'));
    }

    const org = await Organization.findOne({ _id: organizationId, deletedAt: null });
    if (!org) return next(new NotFoundError('Organization not found'));

    const [isMember, canManage] = await Promise.all([
      OrganizationMember.findOne({
        userId: req.userId,
        organizationId,
        status: 'active',
      }),
      hasPermission(req.userId, 'organization.manage', { organizationId }),
    ]);

    if (!isMember && !canManage) {
      return next(new ForbiddenError('No access to this organization'));
    }

    req.organizationId = organizationId;
    req.organization = org;
    next();
  } catch (err) {
    next(err);
  }
}
