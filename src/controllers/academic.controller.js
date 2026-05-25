import * as academicService from '../services/academic.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createYear = asyncHandler(async (req, res) => {
  const data = await academicService.createAcademicYear(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});

export const createClass = asyncHandler(async (req, res) => {
  const data = await academicService.createClass(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});

export const createSection = asyncHandler(async (req, res) => {
  const data = await academicService.createSection(req.params.classId, req.body);
  res.status(201).json({ success: true, data });
});

export const createTerm = asyncHandler(async (req, res) => {
  const data = await academicService.createTerm(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});

export const listTerms = asyncHandler(async (req, res) => {
  const data = await academicService.listTerms(req.schoolId, req.query.academicYearId);
  res.json({ success: true, data });
});

export const structure = asyncHandler(async (req, res) => {
  const data = await academicService.listAcademicStructure(req.schoolId);
  res.json({ success: true, data });
});

export const listYears = asyncHandler(async (req, res) => {
  const data = await academicService.listYears(req.schoolId);
  res.json({ success: true, data });
});

export const listClasses = asyncHandler(async (req, res) => {
  const data = await academicService.listClasses(req.schoolId);
  res.json({ success: true, data });
});

export const listSections = asyncHandler(async (req, res) => {
  const data = await academicService.listSections(req.params.classId);
  res.json({ success: true, data });
});
