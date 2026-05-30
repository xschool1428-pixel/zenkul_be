import { Organization, OrganizationMember, Role, UserRole } from '../models/index.js';
import { SUPER_ADMIN_CODE } from '../bootstrap/super-admin/systemRoles.js';
import { paginate, buildPaginationMeta, parsePagination } from '../utils/pagination.js';

export async function isPlatformSuperAdmin(userId) {
  const superRole = await Role.findOne({ code: SUPER_ADMIN_CODE, isSystem: true });
  if (!superRole) return false;

  const assignment = await UserRole.findOne({
    userId,
    roleId: superRole._id,
    status: 'active',
    organizationId: null,
    schoolId: null,
  });

  return Boolean(assignment);
}

/** Org ids the user may list (membership + org-scoped role assignments). */
export async function getAccessibleOrganizationIds(userId) {
  const [memberOrgIds, roleOrgIds] = await Promise.all([
    OrganizationMember.find({ userId, status: 'active' }).distinct('organizationId'),
    UserRole.find({ userId, status: 'active', organizationId: { $ne: null } }).distinct(
      'organizationId'
    ),
  ]);

  return [...new Set([...memberOrgIds, ...roleOrgIds].map((id) => String(id)))];
}

function buildListFilter(query) {
  const filter = { deletedAt: null };
  if (query.status) filter.status = query.status;

  const search = query.search?.trim();
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ name: regex }, { slug: regex }, { email: regex }];
  }

  return filter;
}

/**
 * List organizations with pagination.
 * - Platform SUPER_ADMIN: all non-deleted organizations.
 * - Org admin / staff: only organizations they belong to or are scoped to.
 */
export async function listOrganizations(userId, query = {}) {
  const filter = buildListFilter(query);
  const platformAdmin = await isPlatformSuperAdmin(userId);

  if (!platformAdmin) {
    const accessibleIds = await getAccessibleOrganizationIds(userId);
    if (accessibleIds.length === 0) {
      const { page, limit } = parsePagination(query);
      return { items: [], meta: buildPaginationMeta({ page, limit, total: 0 }) };
    }
    filter._id = { $in: accessibleIds };
  }

  const { items, meta } = await paginate(Organization, filter, query, {
    sort: { name: 1 },
    defaultLimit: 20,
  });

  return { items, meta };
}
