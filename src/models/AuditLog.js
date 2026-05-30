import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: mongoose.Schema.Types.ObjectId,
    beforeState: mongoose.Schema.Types.Mixed,
    afterState: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    correlationId: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ schoolId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
