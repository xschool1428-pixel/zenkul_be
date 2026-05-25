import mongoose from 'mongoose';
import { timestampsPlugin, softDeletePlugin } from './plugins/timestamps.js';
import { ROLE_SCOPE } from '../constants/enums.js';

const rolePermissionSchema = new mongoose.Schema(
  {
    permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission', required: true },
    effect: { type: String, enum: ['allow', 'deny'], default: 'allow' },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    scopeLevel: { type: String, enum: ROLE_SCOPE, required: true },
    isSystem: { type: Boolean, default: false },
    parentRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    permissions: [rolePermissionSchema],
  },
  { timestamps: false }
);

roleSchema.plugin(timestampsPlugin);
roleSchema.plugin(softDeletePlugin);
roleSchema.index({ organizationId: 1, schoolId: 1, code: 1 });

export const Role = mongoose.model('Role', roleSchema);
