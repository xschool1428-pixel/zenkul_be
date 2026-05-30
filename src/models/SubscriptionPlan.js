import mongoose from 'mongoose';
import { timestampsPlugin } from './plugins/timestamps.js';

const planFeatureSchema = new mongoose.Schema(
  {
    featureCode: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    limitValue: Number,
  },
  { _id: false }
);

const subscriptionPlanSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    billingInterval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    pricePerUserPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    minUsers: { type: Number, default: 1 },
    maxSchools: Number,
    features: [planFeatureSchema],
    /** Permissions included when an org is on this plan */
    permissionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    isActive: { type: Boolean, default: true },
    razorpayPlanId: String,
  },
  { timestamps: false }
);

subscriptionPlanSchema.plugin(timestampsPlugin);

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
