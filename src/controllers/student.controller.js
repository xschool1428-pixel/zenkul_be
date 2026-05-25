import * as studentService from '../services/student.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { decryptAadhaar } from '../utils/aadhaar.js';
import { StudentProfile } from '../models/index.js';
export const create = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(
    req.schoolId,
    req.body,
    req.userId,
    req
  );
  res.status(201).json({ success: true, data: student });
});

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await studentService.listStudents(req.schoolId, req.query);
  res.json({ success: true, data, meta });
});

export const get = asyncHandler(async (req, res) => {
  const data = await studentService.getStudent(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await studentService.updateStudent(
    req.schoolId,
    req.params.id,
    req.body,
    req.userId,
    req
  );
  res.json({ success: true, data });
});

export const updateAadhaar = asyncHandler(async (req, res) => {
  const profile = await studentService.updateStudentAadhaar(
    req.params.id,
    req.body.aadhaar,
    req.userId,
    req
  );
  res.json({ success: true, data: profile });
});

export const viewAadhaar = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ studentId: req.params.id }).select(
    '+aadhaarEncrypted'
  );
  if (!profile?.aadhaarEncrypted) {
    return res.json({ success: true, data: { aadhaar: null } });
  }
  const aadhaar = decryptAadhaar(profile.aadhaarEncrypted);
  res.json({ success: true, data: { aadhaar, masked: `XXXX-XXXX-${profile.aadhaarLast4}` } });
});
