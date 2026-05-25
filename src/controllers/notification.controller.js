import * as notificationService from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const data = await notificationService.listUserNotifications(req.userId);
  res.json({ success: true, data });
});

export const markRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markRead(req.params.id, req.userId);
  res.json({ success: true, data });
});
