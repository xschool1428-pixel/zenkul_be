import mongoose from 'mongoose';
import { SUBMISSION_STATUS } from '../constants/enums.js';

const classroomSubmissionSchema = new mongoose.Schema(
  {
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassroomMaterial', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    content: String,
    attachments: mongoose.Schema.Types.Mixed,
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date,
    score: Number,
    maxScore: Number,
    feedback: String,
    gradedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: SUBMISSION_STATUS, default: 'submitted' },
  },
  { timestamps: true }
);

classroomSubmissionSchema.index({ materialId: 1, studentId: 1 }, { unique: true });

export const ClassroomSubmission = mongoose.model('ClassroomSubmission', classroomSubmissionSchema);
