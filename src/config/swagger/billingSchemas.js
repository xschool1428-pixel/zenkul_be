/** Reusable OpenAPI schemas for billing, permissions, and subscription APIs */

export const objectIdSchema = { type: 'string', pattern: '^[a-f0-9]{24}$' };

export const planFeatureSchema = {
  type: 'object',
  required: ['featureCode'],
  properties: {
    featureCode: { type: 'string', example: 'attendance' },
    enabled: { type: 'boolean', default: true },
    limitValue: { type: 'integer' },
  },
};

export const createSubscriptionPlanRequest = {
  type: 'object',
  required: ['code', 'name', 'pricePerUserPaise'],
  properties: {
    code: { type: 'string', minLength: 2, maxLength: 50, example: 'professional' },
    name: { type: 'string', minLength: 2, maxLength: 100, example: 'Professional' },
    billingInterval: { type: 'string', enum: ['monthly', 'yearly'], default: 'monthly' },
    pricePerUserPaise: { type: 'integer', minimum: 100, example: 5000, description: '₹50 = 5000 paise' },
    permissionIds: { type: 'array', items: objectIdSchema, default: [] },
    maxSchools: { type: 'integer', minimum: 1 },
    features: { type: 'array', items: planFeatureSchema },
    isActive: { type: 'boolean', default: true },
  },
};

export const updateSubscriptionPlanRequest = {
  type: 'object',
  minProperties: 1,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    pricePerUserPaise: { type: 'integer', minimum: 100 },
    billingInterval: { type: 'string', enum: ['monthly', 'yearly'] },
    permissionIds: { type: 'array', items: objectIdSchema },
    maxSchools: { type: 'integer', minimum: 1 },
    features: { type: 'array', items: planFeatureSchema },
    isActive: { type: 'boolean' },
  },
};

export const updateOrgBillingRequest = {
  type: 'object',
  minProperties: 1,
  properties: {
    planId: objectIdSchema,
    discountPercent: { type: 'number', minimum: 0, maximum: 100, example: 20 },
    discountPaisePerSeat: { type: 'integer', minimum: 0, example: 0 },
    customPricePerUserPaise: { type: 'integer', minimum: 0, nullable: true, example: 4000 },
  },
};

export const setOrgPermissionsRequest = {
  type: 'object',
  required: ['permissionIds'],
  properties: {
    permissionIds: { type: 'array', items: objectIdSchema },
  },
};

export const assignOrgPlanRequest = {
  type: 'object',
  required: ['planId'],
  properties: {
    planId: objectIdSchema,
  },
};

export const createOrgRoleRequest = {
  type: 'object',
  required: ['name', 'code', 'permissionIds'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    code: { type: 'string', minLength: 2, maxLength: 50, example: 'SENIOR_TEACHER' },
    permissionIds: { type: 'array', minItems: 1, items: objectIdSchema },
    schoolId: { ...objectIdSchema, description: 'Optional school-scoped role' },
  },
};

export const updateOrgRoleRequest = {
  type: 'object',
  minProperties: 1,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    permissionIds: { type: 'array', minItems: 1, items: objectIdSchema },
  },
};

export const initiatePlatformPaymentRequest = {
  type: 'object',
  properties: {
    idempotencyKey: { type: 'string', example: 'platform-org-2026-05-01' },
    seatCount: { type: 'integer', minimum: 1, description: 'Defaults to billable seat count' },
  },
};

export const verifyRazorpayPaymentRequest = {
  type: 'object',
  required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
  properties: {
    razorpay_order_id: { type: 'string' },
    razorpay_payment_id: { type: 'string' },
    razorpay_signature: { type: 'string' },
  },
};

export const subscriptionAccessSnapshot = {
  type: 'object',
  properties: {
    organizationId: objectIdSchema,
    subscriptionId: objectIdSchema,
    plan: {
      type: 'object',
      properties: {
        id: objectIdSchema,
        code: { type: 'string', example: 'starter' },
        name: { type: 'string' },
        billingInterval: { type: 'string', enum: ['monthly', 'yearly'] },
      },
    },
    status: { type: 'string', enum: ['trialing', 'active', 'past_due', 'canceled', 'paused'] },
    access: { type: 'string', enum: ['full', 'grace', 'blocked'] },
    phase: {
      type: 'string',
      enum: ['active', 'grace', 'suspended', 'payment_required', 'canceled', 'platform'],
    },
    seatCount: { type: 'integer', example: 12 },
    pricePerUserPaise: { type: 'integer', example: 5000 },
    amountDuePaise: { type: 'integer', example: 60000 },
    discountPercent: { type: 'number', example: 0 },
    discountPaisePerSeat: { type: 'integer', example: 0 },
    customPricePerUserPaise: { type: 'integer', nullable: true },
    currentPeriodStart: { type: 'string', format: 'date-time' },
    currentPeriodEnd: { type: 'string', format: 'date-time' },
    gracePeriodEnd: { type: 'string', format: 'date-time' },
    daysUntilDue: { type: 'integer', nullable: true },
    daysLeftInGrace: { type: 'integer', nullable: true },
    billingPeriodDays: { type: 'integer', example: 30 },
    gracePeriodDays: { type: 'integer', example: 5 },
    canUsePortal: { type: 'boolean' },
    message: { type: 'string', nullable: true },
  },
};

export const billingPreviewResponse = {
  type: 'object',
  properties: {
    ...subscriptionAccessSnapshot.properties,
    currency: { type: 'string', example: 'INR' },
  },
};

export const orgSubscriptionDetailResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: {
      type: 'object',
      properties: {
        access: { $ref: '#/components/schemas/SubscriptionAccessSnapshot' },
        grants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              organizationId: objectIdSchema,
              permissionId: { type: 'object' },
              source: { type: 'string', enum: ['plan', 'super_admin'] },
              planId: objectIdSchema,
            },
          },
        },
      },
    },
  },
};

export const permissionCatalogItem = {
  type: 'object',
  properties: {
    _id: objectIdSchema,
    resource: { type: 'string', example: 'student' },
    action: { type: 'string', example: 'read' },
    description: { type: 'string' },
    category: { type: 'string', example: 'general' },
    isSystem: { type: 'boolean' },
    isPlatformOnly: { type: 'boolean' },
    isActive: { type: 'boolean' },
  },
};

export const auditLogEntry = {
  type: 'object',
  properties: {
    _id: objectIdSchema,
    organizationId: objectIdSchema,
    schoolId: objectIdSchema,
    actorUserId: { type: 'object' },
    action: { type: 'string', example: 'create' },
    entityType: { type: 'string', example: 'student' },
    entityId: objectIdSchema,
    beforeState: { type: 'object' },
    afterState: { type: 'object' },
    ipAddress: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const organizationListItem = {
  type: 'object',
  properties: {
    _id: objectIdSchema,
    name: { type: 'string' },
    slug: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    city: { type: 'string' },
    status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'pending'] },
  },
};
