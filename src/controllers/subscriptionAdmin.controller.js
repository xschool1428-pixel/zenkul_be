import { asyncHandler } from '../utils/asyncHandler.js';
import * as subscriptionPlanService from '../services/subscriptionPlan.service.js';
import * as organizationEntitlementService from '../services/organizationEntitlement.service.js';
import * as subscriptionAccessService from '../services/subscriptionAccess.service.js';
import * as permissionCatalogService from '../services/permissionCatalog.service.js';
import * as platformBillingService from '../services/platformBilling.service.js';
import * as roleAdminService from '../services/roleAdmin.service.js';

export const listPlans = asyncHandler(async (req, res) => {
  const data = await subscriptionPlanService.listPlans({ activeOnly: req.query.activeOnly !== 'false' });
  res.json({ success: true, data });
});

export const createPlan = asyncHandler(async (req, res) => {
  const data = await subscriptionPlanService.createPlan(req.body);
  res.status(201).json({ success: true, data });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const data = await subscriptionPlanService.updatePlan(req.params.id, req.body);
  res.json({ success: true, data });
});

export const listCatalogPermissions = asyncHandler(async (req, res) => {
  const data = await permissionCatalogService.listCatalog({
    includePlatformOnly: req.query.includePlatformOnly === 'true',
  });
  res.json({ success: true, data });
});

export const getOrgSubscriptionDetail = asyncHandler(async (req, res) => {
  const organizationId = req.params.organizationId || req.organizationId;
  const access = await subscriptionAccessService.evaluateOrganizationAccess(organizationId);
  const grants = await organizationEntitlementService.listOrganizationGrants(organizationId);
  res.json({ success: true, data: { access, grants } });
});

/** @deprecated alias for platform route */
export const getOrgSubscriptionAdmin = getOrgSubscriptionDetail;

export const updateOrgBilling = asyncHandler(async (req, res) => {
  const data = await subscriptionAccessService.updateOrganizationBilling(
    req.params.organizationId,
    req.body,
    req.userId,
    req
  );
  res.json({ success: true, data });
});

export const setOrgPermissions = asyncHandler(async (req, res) => {
  const grants = await organizationEntitlementService.replaceSuperAdminGrants(
    req.params.organizationId,
    req.body.permissionIds || [],
    req.userId,
    req
  );
  res.json({ success: true, data: grants });
});

export const assignOrgPlan = asyncHandler(async (req, res) => {
  const sub = await subscriptionPlanService.assignPlanToOrganization(
    req.params.organizationId,
    req.body.planId,
    req.userId
  );
  res.json({ success: true, data: sub });
});

export const orgBillingSummary = asyncHandler(async (req, res) => {
  const data = await platformBillingService.getBillingPreview(req.organizationId);
  res.json({ success: true, data });
});

export const listOrgEntitledPermissions = asyncHandler(async (req, res) => {
  const keys = await organizationEntitlementService.getEntitledPermissionKeys(req.organizationId);
  res.json({ success: true, data: keys });
});

export const createOrgRole = asyncHandler(async (req, res) => {
  const role = await roleAdminService.createOrganizationRole({
    organizationId: req.organizationId,
    ...req.body,
  });
  res.status(201).json({ success: true, data: role });
});

export const updateOrgRole = asyncHandler(async (req, res) => {
  const role = await roleAdminService.updateOrganizationRole(
    req.params.roleId,
    req.organizationId,
    req.body
  );
  res.json({ success: true, data: role });
});
