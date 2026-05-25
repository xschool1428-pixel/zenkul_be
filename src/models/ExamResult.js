import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    marksObtained: Number,
    grade: String,
    isAbsent: { type: Boolean, default: false },
    remarks: String,
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

examResultSchema.index({ examId: 1, studentId: 1, subjectId: 1 }, { unique: true });

export const ExamResult = mongoose.model('ExamResult', examResultSchema);
