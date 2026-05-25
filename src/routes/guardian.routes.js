import { Router } from 'express';
import * as guardianController from '../controllers/guardian.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireSchoolContext, assertSchoolAccess } from '../middleware/tenant.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createGuardianSchema, linkGuardianSchema } from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId } from '../validators/common.js';

const router = Router();
router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.post('/', authorize('student.manage'), validate(createGuardianSchema), guardianController.create);
router.get(
  '/:id',
  authorize('student.read'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  guardianController.get
);
router.post(
  '/students/:studentId/link',
  authorize('student.manage'),
  validate(linkGuardianSchema),
  guardianController.linkStudent
);
router.get(
  '/students/:studentId',
  authorize('student.read'),
  validate(Joi.object({ params: Joi.object({ studentId: objectId.required() }) })),
  guardianController.listForStudent
);

export default router;
