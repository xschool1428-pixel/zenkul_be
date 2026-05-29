import { Router } from 'express';
import * as feeController from '../controllers/fee.controller.js';
import { authenticate } from '../middleware/auth.js';
import { schoolApiStack } from '../middleware/tenantStacks.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createFeeCategorySchema,
  createFeeStructureSchema,
} from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId, paginationQuerySchema } from '../validators/common.js';

const router = Router();
router.use(schoolApiStack);

router.get('/categories', authorize('invoice.read'), feeController.listCategories);
router.post(
  '/categories',
  authorize('invoice.manage'),
  validate(createFeeCategorySchema),
  feeController.createCategory
);
router.get(
  '/structures',
  authorize('invoice.read'),
  validate(paginationQuerySchema),
  feeController.listStructures
);
router.post(
  '/structures',
  authorize('invoice.manage'),
  validate(createFeeStructureSchema),
  feeController.createStructure
);
router.get(
  '/structures/:id',
  authorize('invoice.read'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  feeController.getStructure
);

export default router;
