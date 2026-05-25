import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/timestamps.js';

const sectionSchema = new mongoose.Schema(
  {
    schoolClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass', required: true },
    name: { type: String, required: true },
    capacity: Number,
  },
  { timestamps: true }
);

sectionSchema.plugin(softDeletePlugin);
sectionSchema.index({ schoolClassId: 1, name: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const Section = mongoose.model('Section', sectionSchema);
