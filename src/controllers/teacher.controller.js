import * as teacherService from '../services/teacher.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const data = await teacherService.createTeacher(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await teacherService.listTeachers(req.schoolId, req.query);
  res.json({ success: true, data, meta });
});

export const get = asyncHandler(async (req, res) => {
  const data = await teacherService.getTeacher(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await teacherService.updateTeacher(req.schoolId, req.params.id, req.body);
  res.json({ success: true, data });
});
