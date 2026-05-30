import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true },
    action: { type: String, required: true },
    description: String,
    category: { type: String, default: 'general' },
    isSystem: { type: Boolean, default: true },
    /** Cannot be granted to tenants — platform operators only */
    isPlatformOnly: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

permissionSchema.virtual('key').get(function key() {
  return `${this.resource}.${this.action}`;
});

permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const Permission = mongoose.model('Permission', permissionSchema);
