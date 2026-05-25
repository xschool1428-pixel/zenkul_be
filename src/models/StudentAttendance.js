import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../constants/enums.js';

const studentAttendanceSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentEnrollment', required: true },
    attendanceDate: { type: Date, required: true },
    status: { type: String, enum: ATTENDANCE_STATUS, required: true },
    remarks: String,
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

studentAttendanceSchema.index({ studentId: 1, attendanceDate: 1 }, { unique: true });

export const StudentAttendance = mongoose.model('StudentAttendance', studentAttendanceSchema);
