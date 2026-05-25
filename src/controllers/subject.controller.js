import * as subjectService from '../services/subject.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const data = await subjectService.createSubject(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await subjectService.listSubjects(req.schoolId, req.query);
  res.json({ success: true, data, meta });
});

export const get = asyncHandler(async (req, res) => {
  const data = await subjectService.getSubject(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await subjectService.updateSubject(req.schoolId, req.params.id, req.body);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  const data = await subjectService.deleteSubject(req.schoolId, req.params.id);
  res.json({ success: true, data });
});
