import {
  Student,
  Teacher,
  Invoice,
  StudentAttendance,
  Classroom,
  StudentEnrollment,
  OrganizationSubscription,
} from '../models/index.js';

export async function getSchoolDashboard(schoolId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const studentIds = await Student.find({ schoolId, deletedAt: null }).distinct('_id');

  const [
    studentCount,
    teacherCount,
    pendingInvoices,
    todayAttendance,
    classroomCount,
    activeEnrollments,
  ] = await Promise.all([
    Student.countDocuments({ schoolId, deletedAt: null, status: 'active' }),
    Teacher.countDocuments({ schoolId, deletedAt: null, status: 'active' }),
    Invoice.countDocuments({ schoolId, status: { $in: ['issued', 'partially_paid', 'overdue'] } }),
    StudentAttendance.countDocuments({
      schoolId,
      attendanceDate: { $gte: today, $lt: tomorrow },
      status: 'present',
    }),
    Classroom.countDocuments({ schoolId, deletedAt: null, status: 'active' }),
    StudentEnrollment.countDocuments({ status: 'active', studentId: { $in: studentIds } }),
  ]);

  const overdueFees = await Invoice.aggregate([
    { $match: { schoolId, status: 'overdue' } },
    { $group: { _id: null, total: { $sum: { $subtract: ['$totalPaise', '$amountPaidPaise'] } } } },
  ]);

  return {
    studentCount,
    teacherCount,
    pendingInvoices,
    todayPresentCount: todayAttendance,
    classroomCount,
    activeEnrollments,
    overdueFeesPaise: overdueFees[0]?.total || 0,
  };
}

export async function getOrgDashboard(organizationId) {
  const { School } = await import('../models/index.js');
  const schoolCount = await School.countDocuments({ organizationId, deletedAt: null });
  const sub = await OrganizationSubscription.findOne({ organizationId }).populate('planId');

  return {
    schoolCount,
    subscription: sub,
  };
}
