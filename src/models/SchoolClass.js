import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/timestamps.js';

const schoolClassSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    numericLevel: Number,
  },
  { timestamps: true }
);

schoolClassSchema.plugin(softDeletePlugin);
schoolClassSchema.index({ schoolId: 1, name: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const SchoolClass = mongoose.model('SchoolClass', schoolClassSchema);
