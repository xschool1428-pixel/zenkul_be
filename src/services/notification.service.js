import { Notification } from '../models/index.js';
import { emitToUser } from './socket.service.js';

export async function notifyUser({ userId, schoolId, organizationId, title, body, payload }) {
  const n = await Notification.create({
    userId,
    schoolId,
    organizationId,
    channel: 'in_app',
    title,
    body,
    payload,
  });
  emitToUser(String(userId), 'notification:new', {
    id: n._id,
    title,
    body,
    payload,
    createdAt: n.createdAt,
  });
  return n;
}

export async function listUserNotifications(userId, limit = 50) {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function markRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { readAt: new Date() },
    { new: true }
  );
}
