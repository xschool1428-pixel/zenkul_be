import mongoose from 'mongoose';
import { ENTITY_STATUS } from '../constants/enums.js';

const academicYearSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
  },
  { timestamps: true }
);

academicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
