import { School, OrganizationMember, UserSchool } from '../models/index.js';
import { ForbiddenError, BadRequestError } from '../utils/errors.js';

export function requireSchoolContext(req, res, next) {
  const schoolId = req.headers['x-school-id'] || req.params.schoolId || req.body.schoolId;
  if (!schoolId) {
    return next(new BadRequestError('x-school-id header or schoolId is required'));
  }
  req.schoolId = schoolId;
  next();
}

export async function assertSchoolAccess(req, res, next) {
  const schoolId = req.schoolId;
  const membership = await UserSchool.findOne({
    userId: req.userId,
    schoolId,
    status: 'active',
  });
  if (!membership) {
    return next(new ForbiddenError('No access to this school'));
  }
  const school = await School.findById(schoolId);
  if (!school || school.deletedAt) {
    return next(new ForbiddenError('School not found'));
  }
  req.school = school;
  req.organizationId = school.organizationId;
  next();
}

export function requireOrganizationContext(req, res, next) {
  const organizationId =
    req.headers['x-organization-id'] || req.params.organizationId || req.body.organizationId;
  if (!organizationId) {
    return next(new BadRequestError('x-organization-id header or organizationId is required'));
  }
  req.organizationId = organizationId;
  next();
}

export async function assertOrganizationAccess(req, res, next) {
  const membership = await OrganizationMember.findOne({
    userId: req.userId,
    organizationId: req.organizationId,
    status: 'active',
  });
  if (!membership) {
    return next(new ForbiddenError('No access to this organization'));
  }
  next();
}
