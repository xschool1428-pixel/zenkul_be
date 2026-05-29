import { Router } from 'express';
import * as subjectController from '../controllers/subject.controller.js';
import { authenticate } from '../middleware/auth.js';
import { schoolApiStack } from '../middleware/tenantStacks.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createSubjectSchema } from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId, paginationQuerySchema } from '../validators/common.js';

const router = Router();
router.use(schoolApiStack);

router.get('/', authorize('school.read'), validate(paginationQuerySchema), subjectController.list);
router.post('/', authorize('school.manage'), validate(createSubjectSchema), subjectController.create);
router.get(
  '/:id',
  authorize('school.read'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  subjectController.get
);
router.patch(
  '/:id',
  authorize('school.manage'),
  validate(
    Joi.object({
      params: Joi.object({ id: objectId.required() }),
      body: Joi.object({ code: Joi.string(), name: Joi.string(), description: Joi.string() }).min(1),
    })
  ),
  subjectController.update
);
router.delete(
  '/:id',
  authorize('school.manage'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  subjectController.remove
);

export default router;
