import {
  Guardian,
  StudentGuardian,
  Student,
  StudentEnrollment,
  Invoice,
  StudentAttendance,
  StudentRating,
  ExamResult,
  AcademicYear,
  SchoolClass,
  Section,
} from '../models/index.js';
import { NotFoundError } from '../utils/errors.js';
import { getParentStudentIds } from './rbac.service.js';

export async function getParentDashboard(userId) {
  const guardian = await Guardian.findOne({ userId });
  if (!guardian) {
    return { guardian: null, children: [] };
  }

  const links = await StudentGuardian.find({ guardianId: guardian._id });
  const studentIds = links.map((l) => l.studentId);

  const students = await Student.find({ _id: { $in: studentIds }, deletedAt: null });
  const currentYears = await AcademicYear.find({ isCurrent: true });

  const children = await Promise.all(
    links.map(async (link) => {
      const student = students.find((s) => s._id.equals(link.studentId));
      if (!student) return null;

      const year =
        currentYears.find((y) => y.schoolId.equals(student.schoolId)) ||
        (await AcademicYear.findOne({ schoolId: student.schoolId }).sort({ startDate: -1 }));

      let enrollment = null;
      if (year) {
        enrollment = await StudentEnrollment.findOne({
          studentId: student._id,
          academicYearId: year._id,
          status: 'active',
        })
          .populate('schoolClassId', 'name')
          .populate('sectionId', 'name');
      }

      const [invoices, todayAttendance, ratings, recentResults] = await Promise.all([
        Invoice.find({ studentId: student._id, status: { $in: ['issued', 'partially_paid', 'overdue'] } })
          .select('invoiceNumber totalPaise amountPaidPaise status dueAt')
          .limit(5),
        StudentAttendance.findOne({
          studentId: student._id,
          attendanceDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        }),
        StudentRating.find({ studentId: student._id, status: 'published' })
          .populate('subjectId', 'name code')
          .populate('sessionId', 'name code')
          .sort({ ratedDate: -1 })
          .limit(5),
        ExamResult.find({ studentId: student._id, published: true })
          .sort({ updatedAt: -1 })
          .limit(5)
          .populate('subjectId', 'name'),
      ]);

      const feesDuePaise = invoices.reduce(
        (sum, inv) => sum + (inv.totalPaise - inv.amountPaidPaise),
        0
      );

      return {
        studentId: student._id,
        admissionNumber: student.admissionNumber,
        schoolId: student.schoolId,
        relationship: link.relationship,
        class: enrollment?.schoolClassId?.name,
        section: enrollment?.sectionId?.name,
        rollNumber: enrollment?.rollNumber,
        feesDuePaise,
        pendingInvoices: invoices.length,
        attendanceToday: todayAttendance?.status || null,
        recentRatings: ratings.map((r) => ({
          subject: r.subjectId?.name || r.subjectId,
          chapter: r.chapter,
          topic: r.topic,
          score: r.score,
          maxScore: r.maxScore,
          percentage: r.percentage,
          performance: r.performance,
          flag: r.flag,
          ratedDate: r.ratedDate,
          session: r.sessionId?.name,
        })),
        recentResults: recentResults.map((r) => ({
          subject: r.subjectId?.name,
          marks: r.marksObtained,
          grade: r.grade,
        })),
      };
    })
  );

  return {
    guardian: {
      id: guardian._id,
      firstName: guardian.firstName,
      lastName: guardian.lastName,
      phone: guardian.phone,
      aadhaarMasked: guardian.aadhaarLast4 ? `XXXX-XXXX-${guardian.aadhaarLast4}` : null,
    },
    children: children.filter(Boolean),
    childCount: children.filter(Boolean).length,
  };
}

export async function getChildDetail(userId, studentId) {
  await import('./rbac.service.js').then((m) => m.assertParentCanAccessStudent(userId, studentId));

  const student = await Student.findById(studentId);
  if (!student) throw new NotFoundError('Student not found');

  const [enrollment, invoices, attendance, ratings, results] = await Promise.all([
    StudentEnrollment.findOne({ studentId, status: 'active' })
      .populate('schoolClassId sectionId academicYearId'),
    Invoice.find({ studentId }).sort({ createdAt: -1 }).limit(20),
    StudentAttendance.find({ studentId }).sort({ attendanceDate: -1 }).limit(30),
    StudentRating.find({ studentId, status: 'published' })
      .populate('subjectId', 'name')
      .populate('sessionId', 'name')
      .populate('schoolClassId', 'name')
      .populate('sectionId', 'name')
      .sort({ ratedDate: -1 }),
    ExamResult.find({ studentId, published: true }).populate('subjectId', 'name'),
  ]);

  return { student, enrollment, invoices, attendance, ratings, results };
}
