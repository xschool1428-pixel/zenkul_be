import { FeeCategory, FeeStructure } from '../models/index.js';
import { NotFoundError } from '../utils/errors.js';

export async function createCategory(schoolId, data) {
  return FeeCategory.create({ schoolId, ...data });
}

export async function listCategories(schoolId) {
  return FeeCategory.find({ schoolId }).sort({ name: 1 });
}

export async function createStructure(schoolId, data) {
  return FeeStructure.create({ schoolId, ...data });
}

export async function listStructures(schoolId, filters = {}) {
  const { paginate } = await import('../utils/pagination.js');
  const q = { schoolId };
  if (filters.academicYearId) q.academicYearId = filters.academicYearId;
  if (filters.schoolClassId) q.schoolClassId = filters.schoolClassId;
  const { items, meta } = await paginate(FeeStructure, q, filters, {
    populate: [
      { path: 'feeCategoryId', select: 'code name' },
      { path: 'schoolClassId', select: 'name' },
    ],
  });
  return { data: items, meta };
}

export async function getStructure(schoolId, id) {
  const f = await FeeStructure.findOne({ _id: id, schoolId });
  if (!f) throw new NotFoundError('Fee structure not found');
  return f;
}
