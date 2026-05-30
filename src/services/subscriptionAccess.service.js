import {
  OrganizationSubscription,
  SubscriptionPlan,
  Organization,
  School,
} from '../models/index.js';
import { config } from '../config/index.js';
import { isPlatformSuperAdmin } from './organization.service.js';
import { countBillableSeats } from './billingSeats.service.js';
import { syncGrantsFromPlan } from './organizationEntitlement.service.js';
import { NotFoundError } from '../utils/errors.js';

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function resolvePricePerUserPaise(plan, subscription) {
  if (subscription?.customPricePerUserPaise != null) {
    return subscription.customPricePerUserPaise;
  }
  let price = plan?.pricePerUserPaise ?? config.billing.defaultPricePerUserPaise;
  const discountPercent = subscription?.discountPercent ?? 0;
  const discountPaise = subscription?.discountPaisePerSeat ?? 0;
  price = Math.round(price * (1 - discountPercent / 100)) - discountPaise;
  return Math.max(price, 100);
}

export async function ensureOrganizationSubscription(organizationId) {
  let sub = await OrganizationSubscription.findOne({ organizationId });
  if (sub) return sub;

  const plan =
    (await SubscriptionPlan.findOne({ code: 'starter', isActive: true })) ||
    (await SubscriptionPlan.findOne({ isActive: true }));

  if (!plan) throw new NotFoundError('No subscription plan configured');

  sub = await OrganizationSubscription.create({
    organizationId,
    planId: plan._id,
    status: 'trialing',
    seatCount: 0,
    discountPercent: 0,
    discountPaisePerSeat: 0,
  });

  await syncGrantsFromPlan(organizationId, plan._id, null);
  return sub;
}

/**
 * Refresh subscription status from dates. Returns access snapshot.
 * access: 'full' | 'grace' | 'blocked'
 */
export async function evaluateOrganizationAccess(organizationId) {
  const sub = await ensureOrganizationSubscription(organizationId);
  const plan = await SubscriptionPlan.findById(sub.planId);
  const now = new Date();

  if (sub.status === 'canceled') {
    return buildSnapshot(sub, plan, 'blocked', 'canceled', now);
  }

  if (!sub.currentPeriodEnd) {
    return buildSnapshot(sub, plan, 'blocked', 'payment_required', now);
  }

  if (now <= sub.currentPeriodEnd) {
    if (sub.status !== 'active' && sub.status !== 'trialing') {
      sub.status = 'active';
      await sub.save();
    }
    return buildSnapshot(sub, plan, 'full', 'active', now);
  }

  const graceEnd =
    sub.gracePeriodEnd || addDays(sub.currentPeriodEnd, config.billing.gracePeriodDays);

  if (!sub.gracePeriodEnd) {
    sub.gracePeriodEnd = graceEnd;
    await sub.save();
  }

  if (now <= graceEnd) {
    if (sub.status !== 'past_due') {
      sub.status = 'past_due';
      await sub.save();
    }
    return buildSnapshot(sub, plan, 'grace', 'grace', now);
  }

  if (sub.status !== 'paused') {
    sub.status = 'paused';
    sub.accessBlockedAt = sub.accessBlockedAt || now;
    await sub.save();
  }

  return buildSnapshot(sub, plan, 'blocked', 'suspended', now);
}

async function buildSnapshot(sub, plan, access, phase, now) {
  const seatCount = sub.seatCount || (await countBillableSeats(sub.organizationId));
  const pricePerUserPaise = resolvePricePerUserPaise(plan, sub);
  const amountDuePaise = seatCount * pricePerUserPaise;

  const msDay = 86400000;
  let daysUntilDue = null;
  let daysLeftInGrace = null;

  if (sub.currentPeriodEnd) {
    daysUntilDue = Math.ceil((sub.currentPeriodEnd - now) / msDay);
  }
  if (sub.gracePeriodEnd && phase === 'grace') {
    daysLeftInGrace = Math.max(0, Math.ceil((sub.gracePeriodEnd - now) / msDay));
  }

  return {
    organizationId: sub.organizationId,
    subscriptionId: sub._id,
    plan: plan
      ? { id: plan._id, code: plan.code, name: plan.name, billingInterval: plan.billingInterval }
      : null,
    status: sub.status,
    access,
    phase,
    seatCount,
    pricePerUserPaise,
    amountDuePaise,
    discountPercent: sub.discountPercent ?? 0,
    discountPaisePerSeat: sub.discountPaisePerSeat ?? 0,
    customPricePerUserPaise: sub.customPricePerUserPaise ?? null,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    gracePeriodEnd: sub.gracePeriodEnd,
    daysUntilDue,
    daysLeftInGrace,
    billingPeriodDays: config.billing.billingPeriodDays,
    gracePeriodDays: config.billing.gracePeriodDays,
    canUsePortal: access === 'full' || access === 'grace',
    message: portalMessage(phase, daysLeftInGrace, daysUntilDue),
  };
}

function portalMessage(phase, daysLeftInGrace, daysUntilDue) {
  if (phase === 'payment_required') {
    return 'Pay the monthly subscription to activate portal access for your organization.';
  }
  if (phase === 'grace') {
    return `Subscription expired. Pay within ${daysLeftInGrace} day(s) to avoid suspension.`;
  }
  if (phase === 'suspended') {
    return 'Portal access suspended. Pay subscription to restore access.';
  }
  if (phase === 'active' && daysUntilDue != null && daysUntilDue <= 5) {
    return `Renew in ${daysUntilDue} day(s) to avoid interruption.`;
  }
  return null;
}

export async function assertOrganizationPortalAccess(organizationId, userId) {
  if (await isPlatformSuperAdmin(userId)) return evaluateOrganizationAccess(organizationId);

  const snapshot = await evaluateOrganizationAccess(organizationId);
  if (!snapshot.canUsePortal) {
    const { ForbiddenError } = await import('../utils/errors.js');
    throw new ForbiddenError(snapshot.message || 'Organization subscription inactive');
  }
  return snapshot;
}

export async function resolveOrganizationIdFromSchool(schoolId) {
  const school = await School.findById(schoolId).select('organizationId');
  return school?.organizationId?.toString() || null;
}

export async function activatePaidPeriod(subscription, payment, session = null) {
  const now = new Date();
  const periodEnd = addDays(now, config.billing.billingPeriodDays);
  const graceEnd = addDays(periodEnd, config.billing.gracePeriodDays);
  const saveOpts = session ? { session } : {};

  subscription.status = 'active';
  subscription.seatCount = payment.seatCount;
  subscription.billedSeatCount = payment.seatCount;
  subscription.currentPeriodStart = now;
  subscription.currentPeriodEnd = periodEnd;
  subscription.gracePeriodEnd = graceEnd;
  subscription.accessBlockedAt = null;
  subscription.lastPlatformPaymentId = payment._id;
  await subscription.save(saveOpts);

  await syncGrantsFromPlan(subscription.organizationId, subscription.planId, payment.paidByUserId);
  return subscription;
}

export async function updateOrganizationBilling(organizationId, body, actorUserId, req) {
  const sub = await ensureOrganizationSubscription(organizationId);

  if (body.planId && String(body.planId) !== String(sub.planId)) {
    sub.planId = body.planId;
    await syncGrantsFromPlan(organizationId, body.planId, actorUserId);
  }
  if (body.discountPercent != null) sub.discountPercent = body.discountPercent;
  if (body.discountPaisePerSeat != null) sub.discountPaisePerSeat = body.discountPaisePerSeat;
  if (body.customPricePerUserPaise !== undefined) {
    sub.customPricePerUserPaise = body.customPricePerUserPaise;
  }

  await sub.save();

  const org = await Organization.findById(organizationId);
  return { subscription: sub, organization: org, access: await evaluateOrganizationAccess(organizationId) };
}
