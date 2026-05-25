import mongoose from 'mongoose';
import { ENTITY_STATUS, CLASSROOM_MEMBER_ROLES } from '../constants/enums.js';

const classroomMemberSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: CLASSROOM_MEMBER_ROLES, default: 'student' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
  },
  { timestamps: true }
);

classroomMemberSchema.index({ classroomId: 1, studentId: 1 }, { unique: true });

export const ClassroomMember = mongoose.model('ClassroomMember', classroomMemberSchema);
