import { SubscriptionPlan, Permission, OrganizationSubscription } from '../models/index.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { assertPermissionIdsExist } from './permissionCatalog.service.js';
import { syncGrantsFromPlan } from './organizationEntitlement.service.js';

export async function listPlans({ activeOnly = true } = {}) {
  const q = activeOnly ? { isActive: true } : {};
  return SubscriptionPlan.find(q).populate('permissionIds').sort({ pricePerUserPaise: 1 });
}

export async function createPlan(body) {
  if (body.permissionIds?.length) await assertPermissionIdsExist(body.permissionIds);

  const plan = await SubscriptionPlan.create({
    code: body.code,
    name: body.name,
    billingInterval: body.billingInterval || 'monthly',
    pricePerUserPaise: body.pricePerUserPaise,
    currency: body.currency || 'INR',
    minUsers: body.minUsers ?? 1,
    maxSchools: body.maxSchools,
    features: body.features || [],
    permissionIds: body.permissionIds || [],
    isActive: body.isActive !== false,
  });

  return plan.populate('permissionIds');
}

export async function updatePlan(planId, body) {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new NotFoundError('Plan not found');

  if (body.permissionIds) {
    await assertPermissionIdsExist(body.permissionIds);
    plan.permissionIds = body.permissionIds;
  }
  if (body.name != null) plan.name = body.name;
  if (body.pricePerUserPaise != null) plan.pricePerUserPaise = body.pricePerUserPaise;
  if (body.billingInterval != null) plan.billingInterval = body.billingInterval;
  if (body.isActive != null) plan.isActive = body.isActive;
  if (body.features != null) plan.features = body.features;
  if (body.maxSchools != null) plan.maxSchools = body.maxSchools;

  await plan.save();

  const subs = await OrganizationSubscription.find({ planId: plan._id });
  for (const sub of subs) {
    await syncGrantsFromPlan(sub.organizationId, plan._id, null);
  }

  return plan.populate('permissionIds');
}

export async function assignPlanToOrganization(organizationId, planId, actorUserId) {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) throw new BadRequestError('Invalid plan');

  let sub = await OrganizationSubscription.findOne({ organizationId });
  if (!sub) {
    sub = await OrganizationSubscription.create({
      organizationId,
      planId: plan._id,
      status: 'trialing',
    });
  } else {
    sub.planId = plan._id;
    await sub.save();
  }

  await syncGrantsFromPlan(organizationId, plan._id, actorUserId);
  return sub.populate('planId');
}
