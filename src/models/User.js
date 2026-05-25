import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { timestampsPlugin, softDeletePlugin } from './plugins/timestamps.js';
import { ENTITY_STATUS } from '../constants/enums.js';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: String,
    dateOfBirth: Date,
    avatarUrl: String,
    locale: { type: String, default: 'en' },
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
    mfaEnabled: { type: Boolean, default: false },
    lastLoginAt: Date,
    emailVerifiedAt: Date,
  },
  { timestamps: false }
);

userSchema.plugin(timestampsPlugin);
userSchema.plugin(softDeletePlugin);
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

userSchema.methods.comparePassword = async function (plain) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plain) {
  return bcrypt.hash(plain, 12);
};

export const User = mongoose.model('User', userSchema);
