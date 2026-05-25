import { Router } from 'express';
import * as schoolController from '../controllers/school.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createSchoolSchema,
  updateSchoolSchema,
} from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId } from '../validators/common.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('organization.manage'),
  validate(createSchoolSchema),
  schoolController.createSchool
);

router.get('/', schoolController.listSchools);

router.get(
  '/:id',
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  schoolController.getSchool
);

router.patch(
  '/:id',
  authorize('school.manage'),
  validate(updateSchoolSchema),
  schoolController.updateSchool
);

export default router;
