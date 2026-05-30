import { Organization, SubscriptionPlan } from '../models/index.js';
import { ensureOrganizationSubscription } from '../services/subscriptionAccess.service.js';
import { ensurePermissionsSeeded } from '../services/permissionCatalog.service.js';
import { config } from '../config/index.js';

const STARTER_PERMISSION_KEYS = [
  'student.read',
  'student.create',
  'student.manage',
  'school.read',
  'school.manage',
  'attendance.read',
  'attendance.mark',
  'rating.read',
  'rating.create',
  'exam.read',
  'exam.manage',
  'classroom.read',
  'classroom.create',
  'classroom.manage',
  'classroom.material',
  'invoice.read',
  'invoice.manage',
  'fee.pay',
  'subscription.manage',
];

export async function ensureBillingDefaults() {
  const perms = await ensurePermissionsSeeded();
  const permMap = Object.fromEntries(
    perms.map((p) => [`${p.resource}.${p.action}`, p._id])
  );

  const permissionIds = STARTER_PERMISSION_KEYS.map((k) => permMap[k]).filter(Boolean);

  await SubscriptionPlan.findOneAndUpdate(
    { code: 'starter' },
    {
      code: 'starter',
      name: 'Starter',
      billingInterval: 'monthly',
      pricePerUserPaise: config.billing.defaultPricePerUserPaise,
      currency: 'INR',
      minUsers: 1,
      permissionIds,
      features: [
        { featureCode: 'attendance', enabled: true },
        { featureCode: 'fees', enabled: true },
        { featureCode: 'ratings', enabled: true },
        { featureCode: 'exams', enabled: true },
      ],
      isActive: true,
    },
    { upsert: true, new: true }
  );

  const orgs = await Organization.find({ deletedAt: null }).select('_id');
  for (const org of orgs) {
    await ensureOrganizationSubscription(org._id);
  }

  return {
    permissionCount: perms.length,
    starterPermissionCount: permissionIds.length,
    organizationsInitialized: orgs.length,
  };
}
