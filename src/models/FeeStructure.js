import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    schoolClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass' },
    feeCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeCategory', required: true },
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    dueDayOfMonth: Number,
    isMandatory: { type: Boolean, default: true },
    validFrom: Date,
    validTo: Date,
  },
  { timestamps: true }
);

export const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
