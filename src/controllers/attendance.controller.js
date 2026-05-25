import * as attendanceService from '../services/attendance.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const mark = asyncHandler(async (req, res) => {
  const record = await attendanceService.markAttendance(
    req.schoolId,
    req.body,
    req.userId,
    req
  );
  res.status(201).json({ success: true, data: record });
});

export const listByStudent = asyncHandler(async (req, res) => {
  const data = await attendanceService.getAttendanceByStudent(
    req.params.studentId,
    req.query.from,
    req.query.to
  );
  res.json({ success: true, data });
});
