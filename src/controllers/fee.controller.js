import * as feeService from '../services/fee.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCategory = asyncHandler(async (req, res) => {
  const data = await feeService.createCategory(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});

export const listCategories = asyncHandler(async (req, res) => {
  const data = await feeService.listCategories(req.schoolId);
  res.json({ success: true, data });
});

export const createStructure = asyncHandler(async (req, res) => {
  const data = await feeService.createStructure(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});

export const listStructures = asyncHandler(async (req, res) => {
  const { data, meta } = await feeService.listStructures(req.schoolId, req.query);
  res.json({ success: true, data, meta });
});

export const getStructure = asyncHandler(async (req, res) => {
  const data = await feeService.getStructure(req.schoolId, req.params.id);
  res.json({ success: true, data });
});
