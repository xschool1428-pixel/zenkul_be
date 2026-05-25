import { Subject } from '../models/index.js';
import { NotFoundError } from '../utils/errors.js';

export async function createSubject(schoolId, data) {
  return Subject.create({ schoolId, ...data });
}

export async function listSubjects(schoolId, query = {}) {
  const { paginate } = await import('../utils/pagination.js');
  const { items, meta } = await paginate(
    Subject,
    { schoolId, deletedAt: null },
    query,
    { sort: { name: 1 } }
  );
  return { data: items, meta };
}

export async function getSubject(schoolId, id) {
  const s = await Subject.findOne({ _id: id, schoolId, deletedAt: null });
  if (!s) throw new NotFoundError('Subject not found');
  return s;
}

export async function updateSubject(schoolId, id, data) {
  const s = await Subject.findOneAndUpdate(
    { _id: id, schoolId, deletedAt: null },
    { $set: data },
    { new: true }
  );
  if (!s) throw new NotFoundError('Subject not found');
  return s;
}

export async function deleteSubject(schoolId, id) {
  const s = await Subject.findOne({ _id: id, schoolId });
  if (!s) throw new NotFoundError('Subject not found');
  s.deletedAt = new Date();
  await s.save();
  return { deleted: true };
}
