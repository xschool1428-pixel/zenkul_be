import mongoose from 'mongoose';
import { timestampsPlugin } from './plugins/timestamps.js';
import { CLASSROOM_MATERIAL_TYPES, MATERIAL_PUBLISH_STATUS } from '../constants/enums.js';

const classroomMaterialSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    materialType: { type: String, enum: CLASSROOM_MATERIAL_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubjectChapter' },
    chapter: String,
    topic: String,
    attachments: [
      {
        fileName: String,
        storageKey: String,
        mimeType: String,
        sizeBytes: Number,
      },
    ],
    dueAt: Date,
    isPinned: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    publishedAt: Date,
    status: { type: String, enum: MATERIAL_PUBLISH_STATUS, default: 'draft' },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: false }
);

classroomMaterialSchema.plugin(timestampsPlugin);
classroomMaterialSchema.index({ classroomId: 1, materialType: 1, publishedAt: -1 });
classroomMaterialSchema.index({ classroomId: 1, subjectId: 1 });

export const ClassroomMaterial = mongoose.model('ClassroomMaterial', classroomMaterialSchema);
