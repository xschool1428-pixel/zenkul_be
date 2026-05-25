import {
  StudentRating,
  Student,
  StudentEnrollment,
  SubjectChapter,
  Term,
} from '../models/index.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { writeAudit } from './audit.service.js';
import { emitToSchool, emitToUser } from './socket.service.js';
import { StudentGuardian } from '../models/index.js';
import {
  performanceFromPercentage,
  flagFromPerformance,
  normalizeRatedDate,
} from '../utils/ratingHelpers.js';

const RATING_POPULATE = [
  { path: 'subjectId', select: 'code name' },
  { path: 'schoolClassId', select: 'name' },
  { path: 'sectionId', select: 'name' },
  { path: 'sessionId', select: 'name code' },
  { path: 'academicYearId', select: 'name' },
  { path: 'chapterId', select: 'chapterNumber chapterName' },
  { path: 'ratedByUserId', select: 'firstName lastName' },
  { path: 'teacherId', select: 'employeeCode' },
];

async function resolveEnrollment(studentId, academicYearId, schoolClassId, sectionId) {
  const enrollment = await StudentEnrollment.findOne({
    studentId,
    academicYearId,
    status: 'active',
  });
  if (!enrollment) {
    throw new BadRequestError('No active enrollment for this academic year');
  }
  if (schoolClassId && !enrollment.schoolClassId.equals(schoolClassId)) {
    throw new BadRequestError('schoolClassId does not match student enrollment');
  }
  if (sectionId && !enrollment.sectionId.equals(sectionId)) {
    throw new BadRequestError('sectionId does not match student enrollment');
  }
  return enrollment;
}

async function enrichFromChapter(data) {
  if (!data.chapterId) return data;
  const ch = await SubjectChapter.findById(data.chapterId);
  if (!ch) throw new NotFoundError('Chapter not found');
  if (!data.chapter) data.chapter = ch.chapterName;
  if (!data.topic && ch.topics?.length) {
    data.topic = ch.topics[0].name;
  }
  return data;
}

function buildPerformanceAndFlag(data) {
  const pct = (data.score / data.maxScore) * 100;
  if (!data.performance) data.performance = performanceFromPercentage(pct);
  if (!data.flag) data.flag = flagFromPerformance(data.performance);
  return data;
}

export async function createRating(schoolId, data, ratedByUserId, req) {
  const student = await Student.findOne({ _id: data.studentId, schoolId, deletedAt: null });
  if (!student) throw new NotFoundError('Student not found');

  const session = await Term.findOne({ _id: data.sessionId, schoolId });
  if (!session) throw new NotFoundError('Session/term not found');

  await enrichFromChapter(data);
  const enrollment = await resolveEnrollment(
    data.studentId,
    data.academicYearId,
    data.schoolClassId,
    data.sectionId
  );

  data.enrollmentId = enrollment._id;
  data.ratedDate = normalizeRatedDate(data.ratedDate || new Date());
  data.maxScore = data.maxScore || 100;
  buildPerformanceAndFlag(data);

  if (data.score > data.maxScore) {
    throw new BadRequestError('score cannot exceed maxScore');
  }

  const rating = await StudentRating.create({
    schoolId,
    studentId: data.studentId,
    enrollmentId: data.enrollmentId,
    academicYearId: data.academicYearId,
    sessionId: data.sessionId,
    schoolClassId: data.schoolClassId,
    sectionId: data.sectionId,
    subjectId: data.subjectId,
    chapterId: data.chapterId,
    chapter: data.chapter,
    topic: data.topic,
    ratedDate: data.ratedDate,
    ratingType: data.ratingType || 'chapter_assessment',
    performance: data.performance,
    score: data.score,
    maxScore: data.maxScore,
    flag: data.flag,
    remarks: data.remarks,
    teacherId: data.teacherId,
    ratedByUserId,
    status: data.status || 'published',
  });

  await writeAudit({
    schoolId,
    actorUserId: ratedByUserId,
    action: 'create',
    entityType: 'student_rating',
    entityId: rating._id,
    afterState: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      chapter: data.chapter,
      topic: data.topic,
      score: data.score,
      performance: data.performance,
      flag: data.flag,
    },
    req,
  });

  const payload = {
    ratingId: rating._id,
    studentId: data.studentId,
    subjectId: data.subjectId,
    chapter: data.chapter,
    topic: data.topic,
    score: data.score,
    percentage: rating.percentage,
    performance: data.performance,
    flag: data.flag,
  };

  emitToSchool(String(schoolId), 'rating:created', payload);

  const guardians = await StudentGuardian.find({ studentId: data.studentId }).populate('guardianId');
  for (const link of guardians) {
    if (link.guardianId?.userId) {
      emitToUser(String(link.guardianId.userId), 'rating:created', payload);
    }
  }

  return StudentRating.findById(rating._id).populate(RATING_POPULATE);
}

export async function updateRating(ratingId, schoolId, data, actorUserId, req) {
  const rating = await StudentRating.findOne({ _id: ratingId, schoolId });
  if (!rating) throw new NotFoundError('Rating not found');

  const before = rating.toObject();
  const allowed = [
    'performance',
    'score',
    'maxScore',
    'flag',
    'remarks',
    'status',
    'chapter',
    'topic',
    'ratedDate',
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) rating[key] = data[key];
  }
  if (data.ratedDate) rating.ratedDate = normalizeRatedDate(data.ratedDate);
  if (data.score != null || data.maxScore != null) {
    buildPerformanceAndFlag(rating);
  }
  await rating.save();

  await writeAudit({
    schoolId,
    actorUserId,
    action: 'update',
    entityType: 'student_rating',
    entityId: ratingId,
    beforeState: before,
    afterState: rating.toObject(),
    req,
  });

  emitToSchool(String(schoolId), 'rating:updated', { ratingId, studentId: rating.studentId });
  return StudentRating.findById(ratingId).populate(RATING_POPULATE);
}

export function buildRatingQuery(filters) {
  const query = {};
  if (filters.schoolId) query.schoolId = filters.schoolId;
  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.academicYearId) query.academicYearId = filters.academicYearId;
  if (filters.sessionId) query.sessionId = filters.sessionId;
  if (filters.schoolClassId) query.schoolClassId = filters.schoolClassId;
  if (filters.sectionId) query.sectionId = filters.sectionId;
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.chapter) query.chapter = filters.chapter;
  if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
  if (filters.flag) query.flag = filters.flag;
  if (filters.performance) query.performance = filters.performance;
  if (filters.ratingType) query.ratingType = filters.ratingType;
  if (filters.status) query.status = filters.status;
  else query.status = { $in: ['published'] };

  if (filters.from || filters.to) {
    query.ratedDate = {};
    if (filters.from) query.ratedDate.$gte = normalizeRatedDate(filters.from);
    if (filters.to) {
      const t = normalizeRatedDate(filters.to);
      t.setHours(23, 59, 59, 999);
      query.ratedDate.$lte = t;
    }
  }
  return query;
}

export async function listRatings(filters = {}) {
  const query = buildRatingQuery(filters);
  return StudentRating.find(query).populate(RATING_POPULATE).sort({ ratedDate: -1, createdAt: -1 });
}

export async function listRatingsForStudent(studentId, filters = {}) {
  return listRatings({ ...filters, studentId });
}

export async function getStudentRatingSummary(studentId, filters = {}) {
  const ratings = await listRatingsForStudent(studentId, { ...filters, status: undefined });
  const published = ratings.filter((r) => r.status === 'published');

  const bySubject = {};
  const byFlag = {};
  let totalPct = 0;

  for (const r of published) {
    const subKey = r.subjectId?._id?.toString() || r.subjectId?.toString() || 'unknown';
    if (!bySubject[subKey]) {
      bySubject[subKey] = {
        subject: r.subjectId,
        totalPercentage: 0,
        count: 0,
        chapters: new Set(),
      };
    }
    bySubject[subKey].totalPercentage += r.percentage || 0;
    bySubject[subKey].count += 1;
    bySubject[subKey].chapters.add(r.chapter);

    byFlag[r.flag] = (byFlag[r.flag] || 0) + 1;
    totalPct += r.percentage || 0;
  }

  return {
    totalRatings: published.length,
    overallAveragePercentage:
      published.length > 0 ? Math.round((totalPct / published.length) * 100) / 100 : null,
    bySubject: Object.values(bySubject).map((s) => ({
      subject: s.subject,
      averagePercentage: Math.round((s.totalPercentage / s.count) * 100) / 100,
      ratingCount: s.count,
      chaptersAssessed: s.chapters.size,
    })),
    byFlag,
  };
}

export async function listClassSectionRatings(schoolId, schoolClassId, sectionId, filters) {
  return listRatings({
    schoolId,
    schoolClassId,
    sectionId,
    ...filters,
  });
}
