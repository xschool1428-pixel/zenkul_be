import mongoose from 'mongoose';
import { timestampsPlugin, softDeletePlugin } from './plugins/timestamps.js';
import { ENTITY_STATUS } from '../constants/enums.js';

const teacherSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeCode: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    qualification: String,
    department: String,
    employmentType: { type: String, default: 'full_time' },
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
  },
  { timestamps: false }
);

teacherSchema.plugin(timestampsPlugin);
teacherSchema.plugin(softDeletePlugin);
teacherSchema.index({ schoolId: 1, employeeCode: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const Teacher = mongoose.model('Teacher', teacherSchema);
