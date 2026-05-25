import mongoose from 'mongoose';
import { NOTIFICATION_CHANNELS } from '../constants/enums.js';

const notificationSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: String, enum: NOTIFICATION_CHANNELS, default: 'in_app' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    payload: mongoose.Schema.Types.Mixed,
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
