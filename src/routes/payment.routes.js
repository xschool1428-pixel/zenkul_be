import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import {
  requireSchoolContext,
  assertSchoolAccess,
  requireOrganizationContext,
  assertOrganizationAccess,
} from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import {
  initiateFeeSchema,
  verifyPaymentSchema,
  initiatePlatformSchema,
} from '../validators/payment.validator.js';

const router = Router();

// Student/parent fee → school's Razorpay linked account (Route transfer)
router.post(
  '/fees/initiate',
  authenticate,
  requireSchoolContext,
  assertSchoolAccess,
  validate(initiateFeeSchema),
  paymentController.initiateStudentFee
);

router.post(
  '/fees/verify',
  authenticate,
  validate(verifyPaymentSchema),
  paymentController.verifyStudentFee
);

// School/org pays platform per user
router.get(
  '/platform/seats',
  authenticate,
  requireOrganizationContext,
  assertOrganizationAccess,
  paymentController.getBillableSeats
);

router.get(
  '/platform/billing-preview',
  authenticate,
  requireOrganizationContext,
  assertOrganizationAccess,
  paymentController.getBillingPreview
);

router.post(
  '/platform/initiate',
  authenticate,
  requireOrganizationContext,
  assertOrganizationAccess,
  validate(initiatePlatformSchema),
  paymentController.initiatePlatformBilling
);

router.post(
  '/platform/verify',
  authenticate,
  validate(verifyPaymentSchema),
  paymentController.verifyPlatformPayment
);

// Razorpay Route onboarding for school
router.post(
  '/schools/razorpay/onboard',
  authenticate,
  requireSchoolContext,
  assertSchoolAccess,
  paymentController.onboardSchoolRazorpay
);

router.post(
  '/schools/razorpay/activate',
  authenticate,
  requireSchoolContext,
  assertSchoolAccess,
  paymentController.activateSchoolRazorpay
);

export default router;
