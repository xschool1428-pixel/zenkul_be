import { Organization, School } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const create = asyncHandler(async (req, res) => {
  const org = await Organization.create(req.body);
  res.status(201).json({ success: true, data: org });
});

export const get = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) throw new NotFoundError('Organization not found');
  res.json({ success: true, data: org });
});

export const listSchools = asyncHandler(async (req, res) => {
  const schools = await School.find({
    organizationId: req.params.id,
    deletedAt: null,
  });
  res.json({ success: true, data: schools });
});
