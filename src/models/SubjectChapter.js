import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/timestamps.js';

/** Curriculum master: chapters & topics per subject per academic year */
const subjectChapterSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    schoolClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass' },
    chapterNumber: { type: Number, required: true },
    chapterName: { type: String, required: true },
    topics: [{ name: String, sortOrder: Number }],
    plannedHours: Number,
  },
  { timestamps: true }
);

subjectChapterSchema.plugin(softDeletePlugin);
subjectChapterSchema.index(
  { schoolId: 1, academicYearId: 1, subjectId: 1, chapterNumber: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

export const SubjectChapter = mongoose.model('SubjectChapter', subjectChapterSchema);
