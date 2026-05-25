import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireSchoolContext, assertSchoolAccess } from '../middleware/tenant.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createInvoiceSchema,
  listInvoiceQuerySchema,
} from '../validators/domain.validators.js';
import Joi from 'joi';
import { objectId } from '../validators/common.js';

const router = Router();

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.post(
  '/',
  authorize('invoice.manage'),
  validate(createInvoiceSchema),
  invoiceController.createInvoice
);
router.get(
  '/',
  authorize('invoice.read'),
  validate(listInvoiceQuerySchema),
  invoiceController.listInvoices
);
router.get(
  '/:id',
  authorize('invoice.read'),
  validate(Joi.object({ params: Joi.object({ id: objectId.required() }) })),
  invoiceController.getInvoice
);

export default router;
