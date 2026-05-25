import mongoose from 'mongoose';
import { timestampsPlugin, softDeletePlugin } from './plugins/timestamps.js';
import { ENTITY_STATUS } from '../constants/enums.js';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    legalName: String,
    countryCode: { type: String, default: 'IN' },
    state: String,
    city: String,
    postalCode: String,
    phone: String,
    email: { type: String, required: true, lowercase: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    locale: { type: String, default: 'en' },
    logoUrl: String,
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
  },
  { timestamps: false }
);

organizationSchema.plugin(timestampsPlugin);
organizationSchema.plugin(softDeletePlugin);
organizationSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const Organization = mongoose.model('Organization', organizationSchema);
