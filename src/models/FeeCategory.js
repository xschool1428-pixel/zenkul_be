import mongoose from 'mongoose';

const feeCategorySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

feeCategorySchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const FeeCategory = mongoose.model('FeeCategory', feeCategorySchema);
