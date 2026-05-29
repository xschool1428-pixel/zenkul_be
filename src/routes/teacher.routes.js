import { Router } from 'express';
import * as teacherController from '../controllers/teacher.controller.js';
import { authenticate } from '../middleware/auth.js';
import { schoolApiStack } from '../middleware/tenantStacks.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTeacherSchema } from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId, paginationQuerySchema } from '../validators/common.js';

const router = Router();
router.use(schoolApiStack);

router.get('/', authorize('school.read'), validate(paginationQuerySchema), teacherController.list);
router.post('/', authorize('school.manage'), validate(createTeacherSchema), teacherController.create);
router.get(
  '/:id',
  authorize('school.read'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  teacherController.get
);
router.patch(
  '/:id',
  authorize('school.manage'),
  validate(
    Joi.object({
      params: Joi.object({ id: objectId.required() }),
      body: Joi.object({
        qualification: Joi.string(),
        department: Joi.string(),
        status: Joi.string(),
        employmentType: Joi.string(),
      }).min(1),
    })
  ),
  teacherController.update
);

export default router;
