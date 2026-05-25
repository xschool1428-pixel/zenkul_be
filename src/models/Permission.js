import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true },
    action: { type: String, required: true },
    description: String,
    isSystem: { type: Boolean, default: true },
  },
  { timestamps: true }
);

permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const Permission = mongoose.model('Permission', permissionSchema);
