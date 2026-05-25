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
