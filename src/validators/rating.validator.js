import Joi from 'joi';
import { RATING_PERFORMANCE, RATING_FLAG, RATING_TYPE, RATING_STATUS } from '../constants/enums.js';

const ratingFields = {
  studentId: Joi.string().required(),
  academicYearId: Joi.string().required(),
  sessionId: Joi.string().required(),
  schoolClassId: Joi.string().required(),
  sectionId: Joi.string().required(),
  subjectId: Joi.string().required(),
  chapterId: Joi.string().optional(),
  chapter: Joi.string().trim().required(),
  topic: Joi.string().trim().required(),
  ratedDate: Joi.date().required(),
  ratingType: Joi.string()
    .valid(...RATING_TYPE)
    .default('chapter_assessment'),
  performance: Joi.string().valid(...RATING_PERFORMANCE).optional(),
  score: Joi.number().min(0).required(),
  maxScore: Joi.number().min(1).default(100),
  flag: Joi.string().valid(...RATING_FLAG).optional(),
  remarks: Joi.string().max(2000).optional(),
  teacherId: Joi.string().optional(),
  status: Joi.string().valid(...RATING_STATUS).default('published'),
};

export const createRatingSchema = Joi.object({
  body: Joi.object(ratingFields).required(),
});

export const updateRatingSchema = Joi.object({
  body: Joi.object({
    performance: Joi.string().valid(...RATING_PERFORMANCE),
    score: Joi.number().min(0),
    maxScore: Joi.number().min(1),
    flag: Joi.string().valid(...RATING_FLAG),
    remarks: Joi.string().max(2000),
    chapter: Joi.string().trim(),
    topic: Joi.string().trim(),
    ratedDate: Joi.date(),
    status: Joi.string().valid(...RATING_STATUS),
  }).min(1),
});

export const listRatingQuerySchema = Joi.object({
  query: Joi.object({
    studentId: Joi.string(),
    academicYearId: Joi.string(),
    sessionId: Joi.string(),
    schoolClassId: Joi.string(),
    sectionId: Joi.string(),
    subjectId: Joi.string(),
    chapter: Joi.string(),
    topic: Joi.string(),
    flag: Joi.string().valid(...RATING_FLAG),
    performance: Joi.string().valid(...RATING_PERFORMANCE),
    ratingType: Joi.string().valid(...RATING_TYPE),
    status: Joi.string().valid(...RATING_STATUS),
    from: Joi.date(),
    to: Joi.date(),
  }),
});

export const createChapterSchema = Joi.object({
  body: Joi.object({
    academicYearId: Joi.string().required(),
    subjectId: Joi.string().required(),
    schoolClassId: Joi.string().optional(),
    chapterNumber: Joi.number().integer().min(1).required(),
    chapterName: Joi.string().required(),
    topics: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          sortOrder: Joi.number().integer(),
        })
      )
      .optional(),
    plannedHours: Joi.number().optional(),
  }).required(),
});

export const createTermSchema = Joi.object({
  body: Joi.object({
    academicYearId: Joi.string().required(),
    name: Joi.string().required(),
    code: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    sortOrder: Joi.number().integer().default(1),
    isCurrent: Joi.boolean().default(false),
  }).required(),
});
