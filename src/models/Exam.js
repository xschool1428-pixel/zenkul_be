import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    name: { type: String, required: true },
    examType: { type: String, required: true },
    publishedAt: Date,
  },
  { timestamps: true }
);

examSchema.index({ schoolId: 1, academicYearId: 1, name: 1 }, { unique: true });

export const Exam = mongoose.model('Exam', examSchema);
