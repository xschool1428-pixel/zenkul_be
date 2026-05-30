import { Router } from 'express';
import * as orgController from '../controllers/organization.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { assertOrganizationReadAccess } from '../middleware/organizationAccess.js';
import {
  createOrganizationSchema,
  listOrganizationsQuerySchema,
} from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId } from '../validators/common.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('organization.manage'),
  validate(listOrganizationsQuerySchema),
  orgController.list
);

router.post(
  '/',
  authorize('organization.manage'),
  validate(createOrganizationSchema),
  orgController.create
);

router.get(
  '/:id',
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  assertOrganizationReadAccess,
  orgController.get
);

router.get(
  '/:id/schools',
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  assertOrganizationReadAccess,
  orgController.listSchools
);

export default router;
