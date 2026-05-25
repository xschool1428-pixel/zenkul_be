import mongoose from 'mongoose';
import { timestampsPlugin, softDeletePlugin } from './plugins/timestamps.js';
import { ENTITY_STATUS } from '../constants/enums.js';

const classroomSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Term' },
    schoolClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    inviteCode: { type: String, required: true, uppercase: true, trim: true },
    primaryTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ENTITY_STATUS, default: 'active' },
  },
  { timestamps: false }
);

classroomSchema.plugin(timestampsPlugin);
classroomSchema.plugin(softDeletePlugin);
classroomSchema.index({ schoolId: 1, inviteCode: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const Classroom = mongoose.model('Classroom', classroomSchema);
