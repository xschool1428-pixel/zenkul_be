import { AuditLog } from '../models/index.js';

export async function listAudits(filters = {}) {
  const { paginate } = await import('../utils/pagination.js');
  const q = {};
  if (filters.schoolId) q.schoolId = filters.schoolId;
  if (filters.organizationId) q.organizationId = filters.organizationId;
  if (filters.entityType) q.entityType = filters.entityType;
  if (filters.actorUserId) q.actorUserId = filters.actorUserId;

  const { items, meta } = await paginate(AuditLog, q, filters, {
    maxLimit: 200,
    populate: { path: 'actorUserId', select: 'firstName lastName email' },
  });
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
  return AuditLog.create({
    organizationId,
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
