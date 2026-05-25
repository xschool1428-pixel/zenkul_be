import { StudentAttendance, Student, StudentEnrollment } from '../models/index.js';
import { NotFoundError } from '../utils/errors.js';
import { emitToSchool, emitToUser } from './socket.service.js';
import { StudentGuardian, Guardian } from '../models/index.js';

export async function markAttendance(schoolId, data, markedBy, req) {
  const student = await Student.findOne({ _id: data.studentId, schoolId });
  if (!student) throw new NotFoundError('Student not found');

  const enrollment = await StudentEnrollment.findOne({
    studentId: data.studentId,
    status: 'active',
  });
  if (!enrollment) throw new NotFoundError('Active enrollment not found');

  const date = new Date(data.attendanceDate);
  date.setHours(0, 0, 0, 0);

  const record = await StudentAttendance.findOneAndUpdate(
    { studentId: data.studentId, attendanceDate: date },
    {
      schoolId,
      studentId: data.studentId,
      enrollmentId: enrollment._id,
      attendanceDate: date,
      status: data.status,
      remarks: data.remarks,
      markedBy,
    },
    { upsert: true, new: true }
  );

  emitToSchool(String(schoolId), 'attendance:marked', {
    studentId: data.studentId,
    status: data.status,
    date,
  });

  const links = await StudentGuardian.find({ studentId: data.studentId }).populate('guardianId');
  for (const link of links) {
    if (link.guardianId?.userId) {
      emitToUser(String(link.guardianId.userId), 'attendance:marked', {
        studentId: data.studentId,
        status: data.status,
        date,
      });
    }
  }

  return record;
}

export async function getAttendanceByStudent(studentId, from, to) {
  const query = { studentId };
  if (from || to) {
    query.attendanceDate = {};
    if (from) query.attendanceDate.$gte = new Date(from);
    if (to) query.attendanceDate.$lte = new Date(to);
  }
  return StudentAttendance.find(query).sort({ attendanceDate: -1 });
}
