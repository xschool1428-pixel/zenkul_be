import { Router } from 'express';
import * as examController from '../controllers/exam.controller.js';
import { authenticate } from '../middleware/auth.js';
import { schoolApiStack } from '../middleware/tenantStacks.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createExamSchema, upsertExamResultSchema } from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId, paginationQuerySchema } from '../validators/common.js';

const router = Router();
router.use(schoolApiStack);

router.get('/', authorize('exam.read'), validate(paginationQuerySchema), examController.list);
router.post('/', authorize('exam.manage'), validate(createExamSchema), examController.create);
router.get(
  '/student/:studentId/results',
  authorize('exam.read'),
  validate(Joi.object({ params: Joi.object({ studentId: objectId.required() }) })),
  examController.studentResults
);
router.post('/results', authorize('exam.manage'), validate(upsertExamResultSchema), examController.upsertResult);
router.get(
  '/:id',
  authorize('exam.read'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  examController.get
);
router.post(
  '/:id/publish',
  authorize('exam.manage'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  examController.publish
);
router.get(
  '/:id/results',
  authorize('exam.read'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  examController.listResults
);

export default router;
