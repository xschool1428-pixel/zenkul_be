import { AuditLog, School } from '../models/index.js';
import { paginate } from '../utils/pagination.js';

function buildAuditFilter(filters = {}) {
  const q = {};
  if (filters.schoolId) q.schoolId = filters.schoolId;
  if (filters.organizationId) q.organizationId = filters.organizationId;
  if (filters.entityType) q.entityType = filters.entityType;
  if (filters.actorUserId) q.actorUserId = filters.actorUserId;
  if (filters.action) q.action = filters.action;
  return q;
}

const auditListOptions = {
  maxLimit: 200,
  sort: { createdAt: -1 },
  populate: { path: 'actorUserId', select: 'firstName lastName email' },
};

export async function listAudits(filters = {}) {
  const q = buildAuditFilter(filters);
  const { items, meta } = await paginate(AuditLog, q, filters, auditListOptions);
  return { data: items, meta };
}

/** All audit events for one school (x-school-id context). */
export async function listSchoolAudits(schoolId, query = {}) {
  return listAudits({ ...query, schoolId });
}

/**
 * All audit events for an organization: direct org logs + every school under the org.
 */
export async function listOrganizationAudits(organizationId, query = {}) {
  const schoolIds = await School.find({ organizationId, deletedAt: null }).distinct('_id');
  const q = buildAuditFilter(query);

  q.$or = [{ organizationId }, { schoolId: { $in: schoolIds } }];

  const { items, meta } = await paginate(AuditLog, q, query, auditListOptions);
  return { data: items, meta };
}

/**
 * Platform-wide audit feed for SUPER_ADMIN.
 * Optional query.organizationId / query.schoolId narrow the result set.
 */
export async function listPlatformAudits(query = {}) {
  const q = buildAuditFilter(query);

  if (query.organizationId && query.schoolId) {
    q.organizationId = query.organizationId;
    q.schoolId = query.schoolId;
  } else if (query.organizationId) {
    return listOrganizationAudits(query.organizationId, query);
  } else if (query.schoolId) {
    q.schoolId = query.schoolId;
  }

  const { items, meta } = await paginate(AuditLog, q, query, auditListOptions);
  return { data: items, meta };
}

export async function writeAudit({
  organizationId,
  schoolId,
  actorUserId,
  action,
  entityType,
  entityId,
  beforeState,
  afterState,
  req,
  correlationId,
}) {
  let orgId = organizationId;
  if (!orgId && schoolId) {
    const school = await School.findById(schoolId).select('organizationId');
    orgId = school?.organizationId;
  }

  return AuditLog.create({
    organizationId: orgId,
    schoolId,
    actorUserId,
    action,
    entityType,
    entityId,
    beforeState,
    afterState,
    ipAddress: req?.ip || req?.headers?.['x-forwarded-for'],
    userAgent: req?.headers?.['user-agent'],
    correlationId,
  });
}
