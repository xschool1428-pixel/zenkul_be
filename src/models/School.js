import mongoose from 'mongoose';
import { timestampsPlugin, softDeletePlugin } from './plugins/timestamps.js';
import { ENTITY_STATUS, RAZORPAY_LINKED_ACCOUNT_STATUS } from '../constants/enums.js';

const schoolSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    countryCode: { type: String, default: 'IN' },
    phone: String,
    email: String,
    principalUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timezone: String,
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
    razorpay: {
      linkedAccountId: String,
      linkedAccountStatus: {
        type: String,
        enum: RAZORPAY_LINKED_ACCOUNT_STATUS,
        default: 'created',
      },
      stakeholderId: String,
      productId: String,
      bankAccountLast4: String,
      activatedAt: Date,
    },
  },
  { timestamps: false }
);

schoolSchema.plugin(timestampsPlugin);
schoolSchema.plugin(softDeletePlugin);
schoolSchema.index({ organizationId: 1, code: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const School = mongoose.model('School', schoolSchema);
