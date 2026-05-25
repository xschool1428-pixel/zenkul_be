import * as roleAdminService from '../services/roleAdmin.service.js';
import * as dashboardService from '../services/dashboard.service.js';
import * as auditService from '../services/audit.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPermissions = asyncHandler(async (req, res) => {
  const data = await roleAdminService.listPermissions();
  res.json({ success: true, data });
});

export const listRoles = asyncHandler(async (req, res) => {
  const data = await roleAdminService.listRoles(req.query);
  res.json({ success: true, data });
});

export const assignRole = asyncHandler(async (req, res) => {
  const data = await roleAdminService.assignRole({
    ...req.body,
    assignedBy: req.userId,
  });
  res.status(201).json({ success: true, data });
});

export const listUserRoles = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.userId;
  const data = await roleAdminService.listUserRoles(userId);
  res.json({ success: true, data });
});

export const listSchoolUsers = asyncHandler(async (req, res) => {
  const data = await roleAdminService.listSchoolUsers(req.schoolId);
  res.json({ success: true, data });
});

export const listPlans = asyncHandler(async (req, res) => {
  const data = await roleAdminService.listPlans();
  res.json({ success: true, data });
});

export const orgSubscription = asyncHandler(async (req, res) => {
  const data = await roleAdminService.getOrgSubscription(req.organizationId);
  res.json({ success: true, data });
});

export const schoolDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSchoolDashboard(req.schoolId);
  res.json({ success: true, data });
});

export const orgDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOrgDashboard(req.organizationId);
  res.json({ success: true, data });
});

export const listAudits = asyncHandler(async (req, res) => {
  const { data, meta } = await auditService.listAudits({
    schoolId: req.schoolId,
    organizationId: req.organizationId,
    ...req.query,
  });
  res.json({ success: true, data, meta });
});
