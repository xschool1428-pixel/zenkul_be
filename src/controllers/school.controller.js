import { School, Organization } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const createSchool = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.body.organizationId);
  if (!org) throw new NotFoundError('Organization not found');

  const school = await School.create(req.body);
  res.status(201).json({ success: true, data: school });
});

export const getSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) throw new NotFoundError('School not found');
  res.json({
    success: true,
    data: {
      ...school.toObject(),
      razorpay: {
        linkedAccountStatus: school.razorpay?.linkedAccountStatus,
        activatedAt: school.razorpay?.activatedAt,
      },
    },
  });
});

export const listSchools = asyncHandler(async (req, res) => {
  const filter = { deletedAt: null };
  if (req.query.organizationId) filter.organizationId = req.query.organizationId;
  const schools = await School.find(filter);
  res.json({ success: true, data: schools });
});

export const updateSchool = asyncHandler(async (req, res) => {
  const school = await School.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { $set: req.body },
    { new: true }
  );
  if (!school) throw new NotFoundError('School not found');
  res.json({ success: true, data: school });
});
