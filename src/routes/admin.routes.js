import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as subscriptionAdminController from '../controllers/subscriptionAdmin.controller.js';
import { authenticate } from '../middleware/auth.js';
import {
  requireOrganizationContext,
  assertOrganizationAccess,
  requireSchoolContext,
  assertSchoolAccess,
} from '../middleware/tenant.js';
import { requireOrganizationSubscription } from '../middleware/requireOrganizationSubscription.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { assertPlatformSuperAdmin } from '../middleware/assertPlatformSuperAdmin.js';
import {
  assignRoleSchema,
  listAuditLogsQuerySchema,
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  updateOrgBillingSchema,
  setOrgPermissionsSchema,
  createOrgRoleSchema,
} from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId } from '../validators/common.js';

const router = Router();

router.use(authenticate);

router.get('/permissions', authorize('organization.manage'), adminController.listPermissions);
router.get(
  '/permissions/catalog',
  authorize('organization.manage'),
  assertPlatformSuperAdmin,
  subscriptionAdminController.listCatalogPermissions
);
router.get('/roles', adminController.listRoles);
router.post(
  '/roles/assign',
  authorize('organization.manage'),
  validate(assignRoleSchema),
  adminController.assignRole
);
router.get('/users/me/roles', adminController.listUserRoles);
router.get(
  '/users/:userId/roles',
  authorize('organization.manage'),
  validate(Joi.object({ params: Joi.object({ userId: objectId.required() }) })),
  adminController.listUserRoles
);

router.get('/subscriptions/plans', subscriptionAdminController.listPlans);
router.post(
  '/subscriptions/plans',
  authorize('organization.manage'),
  assertPlatformSuperAdmin,
  validate(createSubscriptionPlanSchema),
  subscriptionAdminController.createPlan
);
router.patch(
  '/subscriptions/plans/:id',
  authorize('organization.manage'),
  assertPlatformSuperAdmin,
  validate(updateSubscriptionPlanSchema),
  subscriptionAdminController.updatePlan
);

const platformRouter = Router();
platformRouter.use(assertPlatformSuperAdmin);
platformRouter.get(
  '/organizations/:organizationId/subscription',
  validate(Joi.object({ params: Joi.object({ organizationId: objectId.required() }) })),
  subscriptionAdminController.getOrgSubscriptionAdmin
);
platformRouter.patch(
  '/organizations/:organizationId/billing',
  validate(updateOrgBillingSchema),
  subscriptionAdminController.updateOrgBilling
);
platformRouter.put(
  '/organizations/:organizationId/permissions',
  validate(setOrgPermissionsSchema),
  subscriptionAdminController.setOrgPermissions
);
platformRouter.post(
  '/organizations/:organizationId/plan',
  validate(Joi.object({
    params: Joi.object({ organizationId: objectId.required() }),
    body: Joi.object({ planId: objectId.required() }),
  })),
  subscriptionAdminController.assignOrgPlan
);
platformRouter.get(
  '/audit-logs',
  validate(listAuditLogsQuerySchema),
  adminController.listPlatformAudits
);
router.use('/platform', platformRouter);

const orgRouter = Router();
orgRouter.use(requireOrganizationContext, assertOrganizationAccess, requireOrganizationSubscription);
orgRouter.get('/dashboard', authorize('organization.manage'), adminController.orgDashboard);
orgRouter.get('/subscription', authorize('subscription.manage'), subscriptionAdminController.getOrgSubscriptionDetail);
orgRouter.get('/billing/summary', authorize('subscription.manage'), subscriptionAdminController.orgBillingSummary);
orgRouter.get('/permissions', authorize('organization.manage'), subscriptionAdminController.listOrgEntitledPermissions);
orgRouter.post(
  '/roles',
  authorize('organization.manage'),
  validate(createOrgRoleSchema),
  subscriptionAdminController.createOrgRole
);
orgRouter.patch(
  '/roles/:roleId',
  authorize('organization.manage'),
  validate(Joi.object({
    params: Joi.object({ roleId: objectId.required() }),
    body: Joi.object({
      name: Joi.string().min(2).max(100),
      permissionIds: Joi.array().items(objectId).min(1),
    }).min(1),
  })),
  subscriptionAdminController.updateOrgRole
);
orgRouter.get(
  '/audit-logs',
  authorize('organization.manage'),
  validate(listAuditLogsQuerySchema),
  adminController.listOrganizationAudits
);
router.use('/organizations', orgRouter);

const schoolRouter = Router();
schoolRouter.use(requireSchoolContext, assertSchoolAccess, requireOrganizationSubscription);
schoolRouter.get('/dashboard', authorize('school.read'), adminController.schoolDashboard);
schoolRouter.get('/users', authorize('school.manage'), adminController.listSchoolUsers);
schoolRouter.get(
  '/audit-logs',
  authorize('school.manage'),
  validate(listAuditLogsQuerySchema),
  adminController.listSchoolAudits
);
router.use('/schools', schoolRouter);

export default router;
