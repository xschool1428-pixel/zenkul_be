import { AcademicYear, SchoolClass, Section, Term } from '../models/index.js';

export async function createAcademicYear(schoolId, data) {
  if (data.isCurrent) {
    await AcademicYear.updateMany({ schoolId, isCurrent: true }, { isCurrent: false });
  }
  return AcademicYear.create({ schoolId, ...data });
}

export async function createClass(schoolId, data) {
  return SchoolClass.create({ schoolId, ...data });
}

export async function createSection(schoolClassId, data) {
  return Section.create({ schoolClassId, ...data });
}

export async function createTerm(schoolId, data) {
  if (data.isCurrent) {
    await Term.updateMany({ schoolId, academicYearId: data.academicYearId, isCurrent: true }, { isCurrent: false });
  }
  return Term.create({ schoolId, ...data });
}

export async function listTerms(schoolId, academicYearId) {
  return Term.find({ schoolId, academicYearId }).sort({ sortOrder: 1 });
}

export async function listYears(schoolId) {
  return AcademicYear.find({ schoolId }).sort({ startDate: -1 });
}

export async function listClasses(schoolId) {
  return SchoolClass.find({ schoolId, deletedAt: null }).sort({ sortOrder: 1, name: 1 });
}

export async function listSections(schoolClassId) {
  return Section.find({ schoolClassId, deletedAt: null }).sort({ name: 1 });
}

export async function listAcademicStructure(schoolId) {
  const years = await AcademicYear.find({ schoolId }).sort({ startDate: -1 });
  const classes = await SchoolClass.find({ schoolId, deletedAt: null });
  const sections = await Section.find({
    schoolClassId: { $in: classes.map((c) => c._id) },
    deletedAt: null,
  });
  const terms = await Term.find({ schoolId }).sort({ sortOrder: 1 });
  return { years, classes, sections, terms };
}
