import {
  Organization,
  OrganizationSubscription,
  SubscriptionPlan,
  PlatformPayment,
} from '../models/index.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { config } from '../config/index.js';
import * as razorpayService from './razorpay.service.js';
import { emitToOrganization } from './socket.service.js';
import { withTransaction } from '../utils/transaction.js';
import { countBillableSeats } from './billingSeats.service.js';
import {
  ensureOrganizationSubscription,
  evaluateOrganizationAccess,
  resolvePricePerUserPaise,
  activatePaidPeriod,
} from './subscriptionAccess.service.js';

export { countBillableSeats };

export async function getBillingPreview(organizationId) {
  const sub = await ensureOrganizationSubscription(organizationId);
  const plan = await SubscriptionPlan.findById(sub.planId);
  const seatCount = await countBillableSeats(organizationId);
  const pricePerUserPaise = resolvePricePerUserPaise(plan, sub);
  const access = await evaluateOrganizationAccess(organizationId);

  return {
    ...access,
    seatCount,
    pricePerUserPaise,
    amountDuePaise: seatCount * pricePerUserPaise,
    currency: plan?.currency || 'INR',
  };
}

export async function initiatePlatformSubscriptionPayment({
  organizationId,
  paidByUserId,
  idempotencyKey,
  seatCount: requestedSeats,
}) {
  const existing = await PlatformPayment.findOne({ organizationId, idempotencyKey });
  if (existing) return existing;

  const org = await Organization.findById(organizationId);
  if (!org) throw new NotFoundError('Organization not found');

  const sub = await ensureOrganizationSubscription(organizationId);
  const plan = await SubscriptionPlan.findById(sub.planId);
  if (!plan) throw new BadRequestError('No subscription plan configured');

  const seatCount = requestedSeats || (await countBillableSeats(organizationId));
  const pricePerUserPaise = resolvePricePerUserPaise(plan, sub);
  const amountPaise = seatCount * pricePerUserPaise;

  if (amountPaise < 100) throw new BadRequestError('Amount too small');

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + config.billing.billingPeriodDays);

  const payment = await PlatformPayment.create({
    organizationId,
    subscriptionId: sub._id,
    seatCount,
    pricePerUserPaise,
    amountPaise,
    billingPeriodStart: now,
    billingPeriodEnd: periodEnd,
    idempotencyKey,
    paidByUserId,
    status: 'pending',
    metadata: {
      discountPercent: sub.discountPercent,
      discountPaisePerSeat: sub.discountPaisePerSeat,
    },
  });

  const order = await razorpayService.createPlatformOrder({
    amountPaise,
    receipt: `platform_${payment._id}`,
    notes: {
      paymentId: String(payment._id),
      organizationId: String(organizationId),
      type: 'platform_subscription',
      seatCount: String(seatCount),
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
    seatCount,
    pricePerUserPaise,
    amountPaise,
    billingPreview: await getBillingPreview(organizationId),
  };
}

async function activateSubscriptionFromPayment(payment, session) {
  const saveOpts = session ? { session } : {};
  const sub = await OrganizationSubscription.findOne({
    organizationId: payment.organizationId,
  }).session(session || null);

  if (sub) {
    await activatePaidPeriod(sub, payment, session);
  }

  emitToOrganization(String(payment.organizationId), 'subscription:paid', {
    paymentId: payment._id,
    seatCount: payment.seatCount,
  });

  return payment;
}

export async function confirmPlatformPayment({ orderId, paymentId, signature }) {
  const valid = razorpayService.verifyPaymentSignature({ orderId, paymentId, signature });
  if (!valid) throw new BadRequestError('Invalid payment signature');

  const existing = await PlatformPayment.findOne({
    razorpayOrderId: orderId,
    status: 'completed',
  });
  if (existing) return existing;

  return withTransaction(async (session) => {
    const qOpts = session ? { session, new: true } : { new: true };
    const payment = await PlatformPayment.findOneAndUpdate(
      { razorpayOrderId: orderId, status: { $ne: 'completed' } },
      {
        $set: {
          razorpayPaymentId: paymentId,
          status: 'completed',
          paidAt: new Date(),
        },
      },
      qOpts
    );
    if (!payment) throw new NotFoundError('Platform payment not found');

    return activateSubscriptionFromPayment(payment, session);
  });
}

export async function handlePlatformWebhook(event, payload) {
  if (event !== 'payment.captured') return null;

  const orderId = payload.order_id;
  const existing = await PlatformPayment.findOne({
    razorpayOrderId: orderId,
    status: 'completed',
  });
  if (existing) return existing;

  return withTransaction(async (session) => {
    const qOpts = session ? { session, new: true } : { new: true };
    const payment = await PlatformPayment.findOneAndUpdate(
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

    return activateSubscriptionFromPayment(payment, session);
  });
}
