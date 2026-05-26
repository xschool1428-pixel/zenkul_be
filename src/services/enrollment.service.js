import {
  StudentEnrollment,
  Student,
  AcademicYear,
  SchoolClass,
  Section,
} from '../models/index.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

export async function createEnrollment(schoolId, data) {
  const student = await Student.findOne({ _id: data.studentId, schoolId });
  if (!student) throw new NotFoundError('Student not found');

  const [year, schoolClass] = await Promise.all([
    AcademicYear.findOne({ _id: data.academicYearId, schoolId }),
    SchoolClass.findOne({ _id: data.schoolClassId, schoolId, deletedAt: null }),
  ]);
  if (!year) throw new NotFoundError('Academic year not found');
  if (!schoolClass) throw new NotFoundError('Class not found');

  const section = await Section.findOne({
    _id: data.sectionId,
    schoolClassId: data.schoolClassId,
    deletedAt: null,
  });
  if (!section) throw new NotFoundError('Section not found for class');

  const existingEnrollment = await StudentEnrollment.findOne({
    studentId: data.studentId,
    academicYearId: data.academicYearId,
  });
  if (existingEnrollment) {
    throw new ConflictError('Student already has an enrollment for this academic year');
  }

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
  const student = await Student.findOne({ _id: studentId, schoolId });
  if (!student) throw new NotFoundError('Student not found');

  const current = await StudentEnrollment.findOne({ studentId, status: 'active' });
  if (!current) throw new BadRequestError('No active enrollment');

  if (!newYearId) {
    throw new BadRequestError('newYearId is required when promoting a student');
  }

  const [targetYear, targetClass] = await Promise.all([
    AcademicYear.findOne({ _id: newYearId, schoolId }),
    SchoolClass.findOne({ _id: newClassId, schoolId, deletedAt: null }),
  ]);
  if (!targetYear) throw new NotFoundError('Target academic year not found');
  if (!targetClass) throw new NotFoundError('Target class not found');

  const targetSection = await Section.findOne({
    _id: newSectionId,
    schoolClassId: newClassId,
    deletedAt: null,
  });
  if (!targetSection) throw new NotFoundError('Target section not found for class');

  if (String(current.academicYearId) === String(newYearId)) {
    throw new ConflictError('Student already has an enrollment for this academic year');
  }

  const existingTargetEnrollment = await StudentEnrollment.findOne({
    studentId,
    academicYearId: newYearId,
  });
  if (existingTargetEnrollment) {
    throw new ConflictError('Student already has an enrollment for this academic year');
  }

  const promotedEnrollment = await StudentEnrollment.create({
    studentId,
    academicYearId: newYearId,
    schoolClassId: newClassId,
    sectionId: newSectionId,
    enrollmentDate: new Date(),
    status: 'active',
  });

  current.status = 'promoted';
  await current.save();

  return promotedEnrollment;
}
