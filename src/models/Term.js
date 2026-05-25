import mongoose from 'mongoose';
import { ENTITY_STATUS } from '../constants/enums.js';

/** Session / semester within an academic year (Term 1, Term 2, etc.) */
const termSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    sortOrder: { type: Number, default: 1 },
    isCurrent: { type: Boolean, default: false },
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
  },
  { timestamps: true }
);

termSchema.index({ academicYearId: 1, code: 1 }, { unique: true });
termSchema.index({ schoolId: 1, isCurrent: 1 });

export const Term = mongoose.model('Term', termSchema);
