import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_PURPOSE } from '../constants/enums.js';

/**
 * Organization/school pays platform — per-user SaaS subscription (stays on platform Razorpay account).
 */
const platformPaymentSchema = new mongoose.Schema(
  {
    purpose: { type: String, default: PAYMENT_PURPOSE.PLATFORM_SUBSCRIPTION },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationSubscription' },
    seatCount: { type: Number, required: true },
    pricePerUserPaise: { type: Number, required: true },
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    status: { type: String, enum: PAYMENT_STATUS, default: 'pending' },
    idempotencyKey: { type: String, required: true },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySubscriptionId: String,
    paidByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

platformPaymentSchema.index({ organizationId: 1, idempotencyKey: 1 }, { unique: true });

export const PlatformPayment = mongoose.model('PlatformPayment', platformPaymentSchema);
