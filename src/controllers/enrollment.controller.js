import * as enrollmentService from '../services/enrollment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const data = await enrollmentService.createEnrollment(req.schoolId, {
    ...req.body,
    studentId: req.params.studentId,
  });
  res.status(201).json({ success: true, data });
});

export const listForStudent = asyncHandler(async (req, res) => {
  const data = await enrollmentService.getStudentEnrollments(req.params.studentId, req.schoolId);
  res.json({ success: true, data });
});

export const promote = asyncHandler(async (req, res) => {
  const data = await enrollmentService.promoteStudent(
    req.params.studentId,
    req.schoolId,
    req.body
  );
  res.status(201).json({ success: true, data });
});
