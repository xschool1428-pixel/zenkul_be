import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/timestamps.js';

const subjectSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    subjectType: { type: String, default: 'core' },
  },
  { timestamps: true }
);

subjectSchema.plugin(softDeletePlugin);
subjectSchema.index({ schoolId: 1, code: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const Subject = mongoose.model('Subject', subjectSchema);
