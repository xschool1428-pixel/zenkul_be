import * as parentService from '../services/parent.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireParentChildAccess } from '../middleware/parentAccess.js';

export const dashboard = asyncHandler(async (req, res) => {
  const data = await parentService.getParentDashboard(req.userId);
  res.json({ success: true, data });
});

export const childDetail = [
  requireParentChildAccess,
  asyncHandler(async (req, res) => {
    const data = await parentService.getChildDetail(req.userId, req.params.studentId);
    res.json({ success: true, data });
  }),
];
