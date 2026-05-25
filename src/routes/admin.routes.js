import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import {
  requireSchoolContext,
  assertSchoolAccess,
  requireOrganizationContext,
  assertOrganizationAccess,
} from '../middleware/tenant.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { assignRoleSchema } from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId, paginationQuerySchema } from '../validators/common.js';

const router = Router();

router.use(authenticate);

router.get('/permissions', authorize('organization.manage'), adminController.listPermissions);
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

router.get('/subscriptions/plans', adminController.listPlans);

const orgRouter = Router();
orgRouter.use(requireOrganizationContext, assertOrganizationAccess);
orgRouter.get('/dashboard', authorize('organization.manage'), adminController.orgDashboard);
orgRouter.get('/subscription', authorize('subscription.manage'), adminController.orgSubscription);
router.use('/organizations', orgRouter);

const schoolRouter = Router();
schoolRouter.use(requireSchoolContext, assertSchoolAccess);
schoolRouter.get('/dashboard', authorize('school.read'), adminController.schoolDashboard);
schoolRouter.get('/users', authorize('school.manage'), adminController.listSchoolUsers);
schoolRouter.get(
  '/audit-logs',
  authorize('school.manage'),
  validate(paginationQuerySchema),
  adminController.listAudits
);
router.use('/schools', schoolRouter);

export default router;
