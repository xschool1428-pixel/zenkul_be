import mongoose from 'mongoose';
import { ENTITY_STATUS } from '../constants/enums.js';

const abacScopeSchema = new mongoose.Schema(
  {
    schoolClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass' },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  },
  { _id: false }
);

const userRoleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
    abacScope: abacScopeSchema,
  },
  { timestamps: true }
);

userRoleSchema.index({ userId: 1, roleId: 1, schoolId: 1 });

export const UserRole = mongoose.model('UserRole', userRoleSchema);
