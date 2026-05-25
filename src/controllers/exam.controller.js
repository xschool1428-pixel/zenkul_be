import * as examService from '../services/exam.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const data = await examService.createExam(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await examService.listExams(req.schoolId, req.query);
  res.json({ success: true, data, meta });
});

export const get = asyncHandler(async (req, res) => {
  const data = await examService.getExam(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

export const publish = asyncHandler(async (req, res) => {
  const data = await examService.publishExam(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

export const upsertResult = asyncHandler(async (req, res) => {
  const data = await examService.upsertResult(req.schoolId, req.body, req.userId);
  res.json({ success: true, data });
});

export const listResults = asyncHandler(async (req, res) => {
  const data = await examService.listResults(req.params.id, req.query);
  res.json({ success: true, data });
});

export const studentResults = asyncHandler(async (req, res) => {
  const data = await examService.getStudentResults(req.params.studentId, req.schoolId);
  res.json({ success: true, data });
});
