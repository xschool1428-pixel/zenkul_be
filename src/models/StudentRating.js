import mongoose from 'mongoose';
import { timestampsPlugin } from './plugins/timestamps.js';
import {
  RATING_PERFORMANCE,
  RATING_FLAG,
  RATING_TYPE,
  RATING_STATUS,
} from '../constants/enums.js';

/**
 * Industrial student performance rating — scoped by class, section, session (term),
 * academic year, subject, chapter, topic, and assessment date.
 */
const studentRatingSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentEnrollment' },

    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', required: true },

    schoolClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },

    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubjectChapter' },
    chapter: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },

    ratedDate: { type: Date, required: true, index: true },
    ratingType: { type: String, enum: RATING_TYPE, required: true, default: 'chapter_assessment' },

    performance: { type: String, enum: RATING_PERFORMANCE, required: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, default: 100, min: 1 },
    percentage: { type: Number, min: 0, max: 100 },

    flag: { type: String, enum: RATING_FLAG, required: true, default: 'normal' },

    remarks: String,
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    ratedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: { type: String, enum: RATING_STATUS, default: 'published' },
    publishedAt: Date,
  },
  { timestamps: false }
);

studentRatingSchema.plugin(timestampsPlugin);

studentRatingSchema.pre('save', function (next) {
  if (this.score != null && this.maxScore > 0) {
    this.percentage = Math.round((this.score / this.maxScore) * 10000) / 100;
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

studentRatingSchema.index(
  {
    schoolId: 1,
    studentId: 1,
    academicYearId: 1,
    sessionId: 1,
    subjectId: 1,
    schoolClassId: 1,
    sectionId: 1,
    chapter: 1,
    topic: 1,
    ratedDate: 1,
    ratingType: 1,
  },
  { unique: true }
);

studentRatingSchema.index({ schoolClassId: 1, sectionId: 1, subjectId: 1, ratedDate: -1 });
studentRatingSchema.index({ sessionId: 1, flag: 1 });

export const StudentRating = mongoose.model('StudentRating', studentRatingSchema);
