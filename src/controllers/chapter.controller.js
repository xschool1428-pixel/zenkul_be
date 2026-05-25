import { SubjectChapter } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const create = asyncHandler(async (req, res) => {
  const chapter = await SubjectChapter.create({
    schoolId: req.schoolId,
    ...req.body,
  });
  res.status(201).json({ success: true, data: chapter });
});

export const list = asyncHandler(async (req, res) => {
  const filter = { schoolId: req.schoolId, deletedAt: null };
  if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;
  if (req.query.schoolClassId) filter.schoolClassId = req.query.schoolClassId;

  const data = await SubjectChapter.find(filter)
    .populate('subjectId', 'code name')
    .sort({ chapterNumber: 1 });
  res.json({ success: true, data });
});

export const get = asyncHandler(async (req, res) => {
  const chapter = await SubjectChapter.findOne({
    _id: req.params.id,
    schoolId: req.schoolId,
    deletedAt: null,
  });
  if (!chapter) throw new NotFoundError('Chapter not found');
  res.json({ success: true, data: chapter });
});
