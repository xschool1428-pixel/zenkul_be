import {
  Invoice,
  StudentFeePayment,
  School,
} from '../models/index.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { config } from '../config/index.js';
import * as razorpayService from './razorpay.service.js';
import { emitToSchool } from './socket.service.js';
import { withTransaction } from '../utils/transaction.js';
import { logger } from '../utils/logger.js';

export async function initiateStudentFeePayment({
  invoiceId,
  paidByUserId,
  idempotencyKey,
}) {
  const existing = await StudentFeePayment.findOne({ idempotencyKey });
  if (existing?.status === 'completed') return { payment: existing, razorpay: null, reused: true };
  if (existing) {
    return {
      payment: existing,
      razorpay: {
        keyId: config.razorpay.keyId,
        orderId: existing.razorpayOrderId,
      },
      reused: true,
    };
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new NotFoundError('Invoice not found');
  if (!['issued', 'partially_paid', 'overdue'].includes(invoice.status)) {
    throw new BadRequestError('Invoice is not payable');
  }

  const amountDue = invoice.totalPaise - invoice.amountPaidPaise;
  if (amountDue <= 0) throw new BadRequestError('Invoice already paid');

  const school = await School.findById(invoice.schoolId);
  if (!school) throw new NotFoundError('School not found');

  const linkedAccountId = school.razorpay?.linkedAccountId;
  if (!linkedAccountId || school.razorpay?.linkedAccountStatus !== 'activated') {
    throw new BadRequestError(
      'School Razorpay account is not activated. Complete Route onboarding first.'
    );
  }

  const platformFeePaise = config.razorpay.platformFeePaise || 0;
  const schoolAmountPaise = amountDue - platformFeePaise;

  const payment = await StudentFeePayment.create({
    schoolId: invoice.schoolId,
    invoiceId: invoice._id,
    studentId: invoice.studentId,
    paidByUserId,
    amountPaise: amountDue,
    platformFeePaise,
    schoolAmountPaise,
    idempotencyKey,
    razorpayLinkedAccountId: linkedAccountId,
    status: 'pending',
  });

  const order = await razorpayService.createStudentFeeOrder({
    amountPaise: amountDue,
    schoolLinkedAccountId: linkedAccountId,
    platformFeePaise,
    receipt: `fee_${payment._id}`,
    notes: {
      paymentId: String(payment._id),
      invoiceId: String(invoice._id),
      schoolId: String(school._id),
      type: 'student_fee',
    },
  });

  payment.razorpayOrderId = order.id;
  await payment.save();

  return {
    payment,
    razorpay: {
      keyId: config.razorpay.keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    },
  };
}

async function applyCompletedFeePayment(payment, paymentId, session) {
  const saveOpts = session ? { session } : {};

  const invoice = await Invoice.findById(payment.invoiceId).session(session || null);
  if (!invoice) throw new NotFoundError('Invoice not found');

  const newPaid = invoice.amountPaidPaise + payment.amountPaise;
  if (newPaid > invoice.totalPaise) {
    logger.warn('Payment exceeds invoice total', {
      invoiceId: invoice._id,
      paymentId: payment._id,
    });
  }

  invoice.amountPaidPaise = Math.min(newPaid, invoice.totalPaise);
  invoice.status = invoice.amountPaidPaise >= invoice.totalPaise ? 'paid' : 'partially_paid';
  await invoice.save(saveOpts);

  emitToSchool(String(payment.schoolId), 'fee:paid', {
    paymentId: payment._id,
    invoiceId: invoice._id,
    studentId: payment.studentId,
    amountPaise: payment.amountPaise,
  });

  return payment;
}

export async function confirmStudentFeePayment({
  orderId,
  paymentId,
  signature,
}) {
  const valid = razorpayService.verifyPaymentSignature({ orderId, paymentId, signature });
  if (!valid) throw new BadRequestError('Invalid payment signature');

  const existing = await StudentFeePayment.findOne({
    razorpayOrderId: orderId,
    status: 'completed',
  });
  if (existing) return existing;

  const rzpPayment = await razorpayService.fetchPayment(paymentId);
  if (rzpPayment.status !== 'captured') {
    await StudentFeePayment.updateOne(
      { razorpayOrderId: orderId, status: 'pending' },
      { status: 'failed' }
    );
    throw new BadRequestError('Payment not captured');
  }

  return withTransaction(async (session) => {
    const qOpts = session ? { session, new: true } : { new: true };
    const payment = await StudentFeePayment.findOneAndUpdate(
      { razorpayOrderId: orderId, status: { $in: ['pending', 'failed'] } },
      {
        $set: {
          razorpayPaymentId: paymentId,
          status: 'completed',
          paidAt: new Date(),
          receiptNumber: `RCP-${Date.now()}`,
        },
      },
      qOpts
    );

    if (!payment) {
      const done = await StudentFeePayment.findOne({
        razorpayOrderId: orderId,
        status: 'completed',
      });
      if (done) return done;
      throw new NotFoundError('Payment record not found');
    }

    return applyCompletedFeePayment(payment, paymentId, session);
  });
}

export async function handleStudentFeeWebhook(event, payload) {
  if (event !== 'payment.captured') return null;

  const orderId = payload.order_id;
  const existing = await StudentFeePayment.findOne({
    razorpayOrderId: orderId,
    status: 'completed',
  });
  if (existing) return existing;

  return withTransaction(async (session) => {
    const qOpts = session ? { session, new: true } : { new: true };
    const payment = await StudentFeePayment.findOneAndUpdate(
      { razorpayOrderId: orderId, status: { $ne: 'completed' } },
      {
        $set: {
          razorpayPaymentId: payload.id,
          status: 'completed',
          paidAt: new Date(),
        },
      },
      qOpts
    );
    if (!payment) return null;

    return applyCompletedFeePayment(payment, payload.id, session);
  });
}
