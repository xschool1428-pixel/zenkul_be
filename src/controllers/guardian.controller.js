import * as guardianService from '../services/guardian.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const data = await guardianService.createGuardian(req.body);
  res.status(201).json({ success: true, data });
});

export const get = asyncHandler(async (req, res) => {
  const data = await guardianService.getGuardian(req.params.id);
  res.json({ success: true, data });
});

export const linkStudent = asyncHandler(async (req, res) => {
  const data = await guardianService.linkStudent(
    req.params.studentId,
    req.body.guardianId,
    req.body,
    req.schoolId
  );
  res.status(201).json({ success: true, data });
});

export const listForStudent = asyncHandler(async (req, res) => {
  const data = await guardianService.listStudentGuardians(req.params.studentId, req.schoolId);
  res.json({ success: true, data });
});
