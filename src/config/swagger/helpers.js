export const bearerSecurity = [{ bearerAuth: [] }];

export const schoolHeader = { $ref: '#/components/parameters/schoolIdHeader' };
export const orgHeader = { $ref: '#/components/parameters/organizationIdHeader' };

export const pathId = (name = 'id') => ({
  in: 'path',
  name,
  required: true,
  schema: { type: 'string', pattern: '^[a-f0-9]{24}$' },
});

export const paginationParams = [
  { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
  { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
];

export const auditLogQueryParams = [
  ...paginationParams,
  { in: 'query', name: 'entityType', schema: { type: 'string', maxLength: 80 } },
  { in: 'query', name: 'action', schema: { type: 'string', maxLength: 80 } },
  {
    in: 'query',
    name: 'actorUserId',
    schema: { type: 'string', pattern: '^[a-f0-9]{24}$' },
    description: 'Filter by user who performed the action',
  },
];

export const platformAuditLogQueryParams = [
  ...auditLogQueryParams,
  { in: 'query', name: 'organizationId', schema: { type: 'string', pattern: '^[a-f0-9]{24}$' } },
  { in: 'query', name: 'schoolId', schema: { type: 'string', pattern: '^[a-f0-9]{24}$' } },
];

const baseResponses = {
  400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
  401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
  403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
  404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
};

function buildOp(tag, summary, { security = bearerSecurity, parameters = [], requestBody, responses = {}, description } = {}) {
  return {
    tags: [tag],
    summary,
    ...(description && { description }),
    ...(security !== null && { security }),
    ...(parameters.length > 0 && { parameters }),
    ...(requestBody && { requestBody }),
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
      201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
      ...baseResponses,
      ...responses,
    },
  };
}

export const GET = (tag, summary, opts) => ({ get: buildOp(tag, summary, opts) });
export const POST = (tag, summary, opts) => ({ post: buildOp(tag, summary, opts) });
export const PATCH = (tag, summary, opts) => ({ patch: buildOp(tag, summary, opts) });
export const PUT = (tag, summary, opts) => ({ put: buildOp(tag, summary, opts) });
export const DELETE = (tag, summary, opts) => ({ delete: buildOp(tag, summary, opts) });

export function mergePaths(...items) {
  return Object.assign({}, ...items);
}

export function path(...ops) {
  return Object.assign({}, ...ops);
}

/** Prepend school header to each operation in a path item */
export function schoolPath(pathItem) {
  const result = {};
  for (const [method, op] of Object.entries(pathItem)) {
    result[method] = {
      ...op,
      parameters: [schoolHeader, ...(op.parameters || [])],
    };
  }
  return result;
}

export function orgPath(pathItem) {
  const result = {};
  for (const [method, op] of Object.entries(pathItem)) {
    result[method] = {
      ...op,
      parameters: [orgHeader, ...(op.parameters || [])],
    };
  }
  return result;
}

export const jsonRef = (ref) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: ref } } },
});

/** 200 response with typed `data` payload */
export const respData = (schemaRef, description = 'OK') => ({
  200: {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: schemaRef },
          },
        },
      },
    },
  },
});

/** 201 response with typed `data` payload */
export const resp201 = (schemaRef, description = 'Created') => ({
  201: {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: schemaRef },
          },
        },
      },
    },
  },
});

/** Paginated list response */
export const respPaginated = (itemRef, description = 'Paginated list') => ({
  200: {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { $ref: itemRef } },
            meta: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
      },
    },
  },
});

/** Shorthand for request body $ref */
export const body = jsonRef;
