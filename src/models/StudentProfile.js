import mongoose from 'mongoose';
import { timestampsPlugin } from './plugins/timestamps.js';

const studentProfileSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    bloodGroup: String,
    nationality: String,
    religion: String,
    category: String,
    medicalNotes: String,
    previousSchool: String,
    aadhaarEncrypted: { type: String, select: false },
    aadhaarLast4: String,
    aadhaarVerified: { type: Boolean, default: false },
    aadhaarVerifiedAt: Date,
  },
  { timestamps: false }
);

studentProfileSchema.plugin(timestampsPlugin);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
