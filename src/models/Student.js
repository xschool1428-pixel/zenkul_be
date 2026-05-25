import mongoose from 'mongoose';
import { timestampsPlugin, softDeletePlugin } from './plugins/timestamps.js';
import { ENTITY_STATUS } from '../constants/enums.js';

const studentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    admissionNumber: { type: String, required: true },
    admissionDate: { type: Date, required: true },
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
    profile: {
      bloodGroup: String,
      nationality: String,
      medicalNotes: String,
    },
  },
  { timestamps: false }
);

studentSchema.plugin(timestampsPlugin);
studentSchema.plugin(softDeletePlugin);
studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const Student = mongoose.model('Student', studentSchema);
