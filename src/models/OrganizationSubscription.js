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
    /** End of grace after currentPeriodEnd (reminder window before suspend) */
    gracePeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    /** Super Admin discount — percent off per-seat price (0–100) */
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    /** Fixed paise discount per seat per month */
    discountPaisePerSeat: { type: Number, default: 0, min: 0 },
    /** Overrides plan price when set (paise per user / month) */
    customPricePerUserPaise: { type: Number, min: 0 },
    lastReminderAt: Date,
    accessBlockedAt: Date,
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
