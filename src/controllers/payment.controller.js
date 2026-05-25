import * as feePaymentService from '../services/feePayment.service.js';
import * as platformBillingService from '../services/platformBilling.service.js';
import * as razorpayService from '../services/razorpay.service.js';
import { School } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export const initiateStudentFee = asyncHandler(async (req, res) => {
  const { invoiceId, idempotencyKey } = req.body;
  const result = await feePaymentService.initiateStudentFeePayment({
    invoiceId,
    paidByUserId: req.userId,
    idempotencyKey: idempotencyKey || `fee-${invoiceId}-${Date.now()}`,
  });
  res.json({ success: true, data: result });
});

export const verifyStudentFee = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const payment = await feePaymentService.confirmStudentFeePayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  res.json({ success: true, data: payment });
});

export const initiatePlatformBilling = asyncHandler(async (req, res) => {
  const { idempotencyKey, seatCount } = req.body;
  const result = await platformBillingService.initiatePlatformSubscriptionPayment({
    organizationId: req.organizationId,
    paidByUserId: req.userId,
    idempotencyKey: idempotencyKey || `platform-${req.organizationId}-${Date.now()}`,
    seatCount,
  });
  res.json({ success: true, data: result });
});

export const verifyPlatformPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const payment = await platformBillingService.confirmPlatformPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  res.json({ success: true, data: payment });
});

export const getBillableSeats = asyncHandler(async (req, res) => {
  const count = await platformBillingService.countBillableSeats(req.organizationId);
  res.json({ success: true, data: { seatCount: count } });
});

export const onboardSchoolRazorpay = asyncHandler(async (req, res) => {
  const school = await School.findById(req.schoolId);
  if (!school) throw new NotFoundError('School not found');

  const account = await razorpayService.createLinkedAccount(school, school.email);
  school.razorpay = {
    ...school.razorpay,
    linkedAccountId: account.id,
    linkedAccountStatus: 'created',
  };
  await school.save();

  res.status(201).json({
    success: true,
    data: {
      linkedAccountId: account.id,
      message: 'Complete KYC in Razorpay dashboard, then call activate endpoint',
    },
  });
});

export const activateSchoolRazorpay = asyncHandler(async (req, res) => {
  const school = await School.findById(req.schoolId);
  if (!school?.razorpay?.linkedAccountId) {
    throw new BadRequestError('Linked account not created');
  }

  if (req.body.tncAccepted) {
    await razorpayService.requestLinkedAccountProduct(school.razorpay.linkedAccountId, true);
  }

  school.razorpay.linkedAccountStatus = 'activated';
  school.razorpay.activatedAt = new Date();
  await school.save();

  res.json({ success: true, data: { status: 'activated' } });
});

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  if (!razorpayService.verifyWebhookSignature(rawBody, signature)) {
    throw new BadRequestError('Invalid webhook signature');
  }

  const { event, payload } = req.body;
  const paymentEntity = payload?.payment?.entity || payload?.payment;
  const notes = paymentEntity?.notes || {};

  if (notes.type === 'student_fee') {
    await feePaymentService.handleStudentFeeWebhook(event, paymentEntity);
  } else if (notes.type === 'platform_subscription') {
    await platformBillingService.handlePlatformWebhook(event, paymentEntity);
  } else if (event === 'payment.captured' && paymentEntity?.order_id) {
    await feePaymentService.handleStudentFeeWebhook(event, paymentEntity);
    await platformBillingService.handlePlatformWebhook(event, paymentEntity);
  }

  res.json({ success: true });
});
