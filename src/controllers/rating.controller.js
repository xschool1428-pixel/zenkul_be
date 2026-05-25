import * as ratingService from '../services/rating.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getParentStudentIds, hasPermission } from '../services/rbac.service.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { Student } from '../models/index.js';

async function assertCanViewStudentRatings(userId, studentId, schoolIdHeader) {
  const parentIds = await getParentStudentIds(userId);
  if (parentIds.includes(String(studentId))) return;

  const student = await Student.findById(studentId);
  if (!student) throw new NotFoundError('Student not found');
  const schoolId = schoolIdHeader || student?.schoolId?.toString();
  const allowed =
    (await hasPermission(userId, 'rating.read', { schoolId })) ||
    (await hasPermission(userId, 'student.read', { schoolId }));
  if (!allowed) throw new ForbiddenError('Cannot view ratings for this student');
}

export const create = asyncHandler(async (req, res) => {
  const rating = await ratingService.createRating(req.schoolId, req.body, req.userId, req);
  res.status(201).json({ success: true, data: rating });
});

export const update = asyncHandler(async (req, res) => {
  const rating = await ratingService.updateRating(
    req.params.id,
    req.schoolId,
    req.body,
    req.userId,
    req
  );
  res.json({ success: true, data: rating });
});

export const list = asyncHandler(async (req, res) => {
  const data = await ratingService.listRatings({
    schoolId: req.schoolId,
    ...req.query,
  });
  res.json({ success: true, data });
});

export const listByStudent = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;
  await assertCanViewStudentRatings(req.userId, studentId, req.headers['x-school-id']);
  const data = await ratingService.listRatingsForStudent(studentId, req.query);
  res.json({ success: true, data });
});

export const summary = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;
  await assertCanViewStudentRatings(req.userId, studentId, req.headers['x-school-id']);
  const data = await ratingService.getStudentRatingSummary(studentId, req.query);
  res.json({ success: true, data });
});

export const listByClassSection = asyncHandler(async (req, res) => {
  const data = await ratingService.listClassSectionRatings(
    req.schoolId,
    req.params.classId,
    req.params.sectionId,
    req.query
  );
  res.json({ success: true, data });
});
