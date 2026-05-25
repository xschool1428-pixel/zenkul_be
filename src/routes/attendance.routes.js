import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireSchoolContext, assertSchoolAccess } from '../middleware/tenant.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { markAttendanceSchema } from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId } from '../validators/common.js';

const router = Router();

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.post('/mark', authorize('attendance.mark'), validate(markAttendanceSchema), attendanceController.mark);
router.get(
  '/student/:studentId',
  authorize('attendance.read'),
  validate(Joi.object({ params: Joi.object({ studentId: objectId.required() }) })),
  attendanceController.listByStudent
);

export default router;
