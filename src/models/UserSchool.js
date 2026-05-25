import mongoose from 'mongoose';
import { ENTITY_STATUS } from '../constants/enums.js';

const userSchoolSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
  },
  { timestamps: true }
);

userSchoolSchema.index({ userId: 1, schoolId: 1 }, { unique: true });

export const UserSchool = mongoose.model('UserSchool', userSchoolSchema);
