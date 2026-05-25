import mongoose from 'mongoose';
import { timestampsPlugin } from './plugins/timestamps.js';
import { SUBSCRIPTION_STATUS } from '../constants/enums.js';

const organizationSubscriptionSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { type: String, enum: SUBSCRIPTION_STATUS, default: 'trialing' },
    seatCount: { type: Number, default: 0 },
    billedSeatCount: { type: Number, default: 0 },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    razorpaySubscriptionId: String,
    razorpayCustomerId: String,
    lastPlatformPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformPayment' },
  },
  { timestamps: false }
);

organizationSubscriptionSchema.plugin(timestampsPlugin);
organizationSubscriptionSchema.index({ organizationId: 1 });

export const OrganizationSubscription = mongoose.model(
  'OrganizationSubscription',
  organizationSubscriptionSchema
);
