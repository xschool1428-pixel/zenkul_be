const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(query = {}, options = {}) {
  const defaultLimit = options.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = options.maxLimit ?? MAX_LIMIT;
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginationMeta({ page, limit, total }) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return { page, limit, total, totalPages };
}

/**
 * @param {import('mongoose').Model} Model
 */
export async function paginate(Model, filter, query, options = {}) {
  const { page, limit, skip } = parsePagination(query, options);
  const sort = options.sort ?? { createdAt: -1 };
  let q = Model.find(filter).sort(sort).skip(skip).limit(limit);
  if (options.select) q = q.select(options.select);
  if (options.populate) q = q.populate(options.populate);

  const [items, total] = await Promise.all([q.exec(), Model.countDocuments(filter)]);
  return {
    items,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

export function paginatedResponse(items, meta) {
  return { data: items, meta };
}
