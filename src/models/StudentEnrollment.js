import mongoose from 'mongoose';
import { ENROLLMENT_STATUS } from '../constants/enums.js';

const studentEnrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    schoolClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    rollNumber: String,
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ENROLLMENT_STATUS, default: 'active' },
  },
  { timestamps: true }
);

studentEnrollmentSchema.index({ studentId: 1, academicYearId: 1 }, { unique: true });

export const StudentEnrollment = mongoose.model('StudentEnrollment', studentEnrollmentSchema);
