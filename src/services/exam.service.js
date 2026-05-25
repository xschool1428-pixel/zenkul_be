import { Exam, ExamResult, Student, StudentEnrollment } from '../models/index.js';
import { NotFoundError } from '../utils/errors.js';
import { emitToSchool } from './socket.service.js';

export async function createExam(schoolId, data) {
  return Exam.create({ schoolId, ...data });
}

export async function listExams(schoolId, filters = {}) {
  const { paginate } = await import('../utils/pagination.js');
  const q = { schoolId };
  if (filters.academicYearId) q.academicYearId = filters.academicYearId;
  const { items, meta } = await paginate(Exam, q, filters);
  return { data: items, meta };
}

export async function getExam(schoolId, id) {
  const e = await Exam.findOne({ _id: id, schoolId });
  if (!e) throw new NotFoundError('Exam not found');
  return e;
}

export async function publishExam(schoolId, examId) {
  const exam = await Exam.findOneAndUpdate(
    { _id: examId, schoolId },
    { publishedAt: new Date() },
    { new: true }
  );
  if (!exam) throw new NotFoundError('Exam not found');
  emitToSchool(String(schoolId), 'exam:published', { examId });
  return exam;
}

export async function upsertResult(schoolId, data, enteredBy) {
  const student = await Student.findOne({ _id: data.studentId, schoolId });
  if (!student) throw new NotFoundError('Student not found');

  const result = await ExamResult.findOneAndUpdate(
    { examId: data.examId, studentId: data.studentId, subjectId: data.subjectId },
    {
      schoolId,
      examId: data.examId,
      studentId: data.studentId,
      subjectId: data.subjectId,
      marksObtained: data.marksObtained,
      grade: data.grade,
      isAbsent: data.isAbsent || false,
      remarks: data.remarks,
      enteredBy,
      published: data.published ?? false,
    },
    { upsert: true, new: true }
  );

  return result;
}

export async function listResults(examId, filters = {}) {
  const q = { examId };
  if (filters.studentId) q.studentId = filters.studentId;
  if (filters.published != null) q.published = filters.published === 'true';
  return ExamResult.find(q).populate('subjectId', 'name code').populate('studentId', 'admissionNumber');
}

export async function getStudentResults(studentId, schoolId) {
  return ExamResult.find({ studentId, schoolId, published: true }).populate('subjectId examId');
}
