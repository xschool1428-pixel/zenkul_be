import { StudentEnrollment, Student, AcademicYear } from '../models/index.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export async function createEnrollment(schoolId, data) {
  const student = await Student.findOne({ _id: data.studentId, schoolId });
  if (!student) throw new NotFoundError('Student not found');

  const year = await AcademicYear.findOne({ _id: data.academicYearId, schoolId });
  if (!year) throw new NotFoundError('Academic year not found');

  return StudentEnrollment.create({
    ...data,
    enrollmentDate: data.enrollmentDate || new Date(),
    status: 'active',
  });
}

export async function getStudentEnrollments(studentId, schoolId) {
  const student = await Student.findOne({ _id: studentId, schoolId });
  if (!student) throw new NotFoundError('Student not found');
  return StudentEnrollment.find({ studentId })
    .populate('academicYearId', 'name isCurrent')
    .populate('schoolClassId', 'name')
    .populate('sectionId', 'name')
    .sort({ enrollmentDate: -1 });
}

export async function getCurrentEnrollment(studentId) {
  const enrollment = await StudentEnrollment.findOne({ studentId, status: 'active' })
    .populate('academicYearId')
    .populate('schoolClassId')
    .populate('sectionId');
  return enrollment;
}

export async function promoteStudent(studentId, schoolId, { newClassId, newSectionId, newYearId }) {
  const current = await StudentEnrollment.findOne({ studentId, status: 'active' });
  if (!current) throw new BadRequestError('No active enrollment');

  current.status = 'promoted';
  await current.save();

  return StudentEnrollment.create({
    studentId,
    academicYearId: newYearId || current.academicYearId,
    schoolClassId: newClassId,
    sectionId: newSectionId,
    enrollmentDate: new Date(),
    status: 'active',
  });
}
