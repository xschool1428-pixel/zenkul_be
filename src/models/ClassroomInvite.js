import mongoose from 'mongoose';
import { CLASSROOM_INVITE_STATUS } from '../constants/enums.js';

const classroomInviteSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    inviteCode: { type: String, required: true, uppercase: true },
    email: String,
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    invitedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: CLASSROOM_INVITE_STATUS, default: 'pending' },
    expiresAt: Date,
    acceptedAt: Date,
    acceptedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

classroomInviteSchema.index({ inviteCode: 1 });
classroomInviteSchema.index({ classroomId: 1, email: 1 });

export const ClassroomInvite = mongoose.model('ClassroomInvite', classroomInviteSchema);
