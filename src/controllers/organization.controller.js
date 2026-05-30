import { Organization, School } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';
import * as organizationService from '../services/organization.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await organizationService.listOrganizations(req.userId, req.query);
  res.json({ success: true, data: items, meta });
});

export const create = asyncHandler(async (req, res) => {
  const org = await Organization.create(req.body);
  const { ensureOrganizationSubscription } = await import('../services/subscriptionAccess.service.js');
  await ensureOrganizationSubscription(org._id);
  res.status(201).json({ success: true, data: org });
});

export const get = asyncHandler(async (req, res) => {
  const org = await Organization.findOne({ _id: req.params.id, deletedAt: null });
  if (!org) throw new NotFoundError('Organization not found');
  res.json({ success: true, data: org });
});

export const listSchools = asyncHandler(async (req, res) => {
  const schools = await School.find({
    organizationId: req.params.id,
    deletedAt: null,
  }).sort({ name: 1 });
  res.json({ success: true, data: schools });
});
