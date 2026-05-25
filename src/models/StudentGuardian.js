import mongoose from 'mongoose';

const studentGuardianSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    guardianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guardian', required: true },
    relationship: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    isEmergencyContact: { type: Boolean, default: false },
    canPickup: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studentGuardianSchema.index({ studentId: 1, guardianId: 1 }, { unique: true });

export const StudentGuardian = mongoose.model('StudentGuardian', studentGuardianSchema);
