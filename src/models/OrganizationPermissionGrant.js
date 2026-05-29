import mongoose from 'mongoose';
import { timestampsPlugin } from './plugins/timestamps.js';

const GRANT_SOURCES = ['plan', 'super_admin'];

const organizationPermissionGrantSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission', required: true },
    source: { type: String, enum: GRANT_SOURCES, required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: Date,
  },
  { timestamps: false }
);

organizationPermissionGrantSchema.plugin(timestampsPlugin);
organizationPermissionGrantSchema.index({ organizationId: 1, permissionId: 1 }, { unique: true });
organizationPermissionGrantSchema.index({ organizationId: 1 });

export const OrganizationPermissionGrant = mongoose.model(
  'OrganizationPermissionGrant',
  organizationPermissionGrantSchema
);
