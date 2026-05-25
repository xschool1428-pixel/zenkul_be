import { Teacher, User, UserSchool } from '../models/index.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export async function createTeacher(schoolId, data) {
  const exists = await Teacher.findOne({ schoolId, employeeCode: data.employeeCode, deletedAt: null });
  if (exists) throw new BadRequestError('Employee code already exists');

  const user = await User.findById(data.userId);
  if (!user) throw new NotFoundError('User not found');

  const teacher = await Teacher.create({
    schoolId,
    userId: data.userId,
    employeeCode: data.employeeCode,
    joiningDate: data.joiningDate || new Date(),
    qualification: data.qualification,
    department: data.department,
    employmentType: data.employmentType || 'full_time',
  });

  await UserSchool.findOneAndUpdate(
    { userId: data.userId, schoolId },
    { userId: data.userId, schoolId, status: 'active' },
    { upsert: true }
  );

  return Teacher.findById(teacher._id).populate('userId', 'firstName lastName email phone');
}

export async function listTeachers(schoolId, query = {}) {
  const { paginate } = await import('../utils/pagination.js');
  const filter = { schoolId, deletedAt: null };
  if (query.status) filter.status = query.status;
  const { items, meta } = await paginate(Teacher, filter, query, {
    populate: { path: 'userId', select: 'firstName lastName email phone' },
  });
  return { data: items, meta };
}

export async function getTeacher(schoolId, teacherId) {
  const teacher = await Teacher.findOne({ _id: teacherId, schoolId, deletedAt: null }).populate(
    'userId',
    'firstName lastName email phone'
  );
  if (!teacher) throw new NotFoundError('Teacher not found');
  return teacher;
}

export async function updateTeacher(schoolId, teacherId, data) {
  const teacher = await Teacher.findOneAndUpdate(
    { _id: teacherId, schoolId, deletedAt: null },
    { $set: data },
    { new: true }
  ).populate('userId', 'firstName lastName email');
  if (!teacher) throw new NotFoundError('Teacher not found');
  return teacher;
}
