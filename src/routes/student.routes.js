import { Router } from 'express';
import * as studentController from '../controllers/student.controller.js';
import * as enrollmentController from '../controllers/enrollment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireSchoolContext, assertSchoolAccess } from '../middleware/tenant.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createStudentSchema,
  updateStudentSchema,
  createEnrollmentSchema,
  promoteStudentSchema,
} from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId, paginationQuerySchema } from '../validators/common.js';

const router = Router();

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get(
  '/',
  authorize('student.read'),
  validate(paginationQuerySchema),
  studentController.list
);
router.post(
  '/',
  authorize('student.create'),
  validate(createStudentSchema),
  studentController.create
);
router.get(
  '/:id',
  authorize('student.read'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  studentController.get
);
router.patch(
  '/:id',
  authorize('student.manage'),
  validate(updateStudentSchema),
  studentController.update
);
router.patch(
  '/:id/aadhaar',
  authorize('student.manage'),
  validate(
    Joi.object({
      params: Joi.object({ id: objectId.required() }),
      body: Joi.object({ aadhaar: Joi.string().length(12).pattern(/^\d+$/).required() }),
    })
  ),
  studentController.updateAadhaar
);
router.get(
  '/:id/aadhaar',
  authorize('student.manage'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  studentController.viewAadhaar
);
router.get(
  '/:studentId/enrollments',
  authorize('student.read'),
  validate(Joi.object({ params: Joi.object({ studentId: objectId.required() }) })),
  enrollmentController.listForStudent
);
router.post(
  '/:studentId/enrollments',
  authorize('student.manage'),
  validate(createEnrollmentSchema),
  enrollmentController.create
);
router.post(
  '/:studentId/promote',
  authorize('student.manage'),
  validate(promoteStudentSchema),
  enrollmentController.promote
);

export default router;
