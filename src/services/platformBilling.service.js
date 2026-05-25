import {
  Organization,
  OrganizationSubscription,
  SubscriptionPlan,
  PlatformPayment,
  UserSchool,
  OrganizationMember,
  School,
} from '../models/index.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { config } from '../config/index.js';
import * as razorpayService from './razorpay.service.js';
import { emitToOrganization } from './socket.service.js';
import { withTransaction } from '../utils/transaction.js';

export async function countBillableSeats(organizationId) {
  const schools = await School.find({ organizationId, deletedAt: null }).select('_id');
  const schoolIds = schools.map((s) => s._id);

  const schoolUsers = await UserSchool.countDocuments({
    schoolId: { $in: schoolIds },
    status: 'active',
  });
  const orgUsers = await OrganizationMember.countDocuments({
    organizationId,
    status: 'active',
  });

  return Math.max(schoolUsers + orgUsers, 1);
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

  let sub = await OrganizationSubscription.findOne({ organizationId });
  const plan = sub
    ? await SubscriptionPlan.findById(sub.planId)
    : await SubscriptionPlan.findOne({ code: 'starter', isActive: true });

  if (!plan) throw new BadRequestError('No subscription plan configured');

  const seatCount = requestedSeats || (await countBillableSeats(organizationId));
  const amountPaise = seatCount * plan.pricePerUserPaise;

  if (amountPaise < 100) throw new BadRequestError('Amount too small');

  const now = new Date();
  const periodEnd = new Date(now);
  if (plan.billingInterval === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const payment = await PlatformPayment.create({
    organizationId,
    subscriptionId: sub?._id,
    seatCount,
    pricePerUserPaise: plan.pricePerUserPaise,
    amountPaise,
    billingPeriodStart: now,
    billingPeriodEnd: periodEnd,
    idempotencyKey,
    paidByUserId,
    status: 'pending',
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

  if (!sub) {
    sub = await OrganizationSubscription.create({
      organizationId,
      planId: plan._id,
      status: 'trialing',
      seatCount,
    });
    payment.subscriptionId = sub._id;
    await payment.save();
  }

  return {
    payment,
    razorpay: {
      keyId: config.razorpay.keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    },
    seatCount,
    pricePerUserPaise: plan.pricePerUserPaise,
  };
}

async function activateSubscriptionFromPayment(payment, session) {
  const saveOpts = session ? { session } : {};
  const sub = await OrganizationSubscription.findOne({
    organizationId: payment.organizationId,
  }).session(session || null);

  if (sub) {
    sub.status = 'active';
    sub.seatCount = payment.seatCount;
    sub.billedSeatCount = payment.seatCount;
    sub.currentPeriodStart = payment.billingPeriodStart;
    sub.currentPeriodEnd = payment.billingPeriodEnd;
    sub.lastPlatformPaymentId = payment._id;
    await sub.save(saveOpts);
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
