import { Guardian, StudentGuardian, Student } from '../models/index.js';
import { NotFoundError } from '../utils/errors.js';
import { encryptAadhaar, aadhaarLast4 } from '../utils/aadhaar.js';

export async function createGuardian(data) {
  if (data.aadhaar) {
    data.aadhaarEncrypted = encryptAadhaar(data.aadhaar);
    data.aadhaarLast4 = aadhaarLast4(data.aadhaar);
    delete data.aadhaar;
  }
  return Guardian.create(data);
}

export async function linkStudent(studentId, guardianId, linkData, schoolId) {
  const student = await Student.findOne({ _id: studentId, schoolId });
  if (!student) throw new NotFoundError('Student not found');
  const guardian = await Guardian.findById(guardianId);
  if (!guardian) throw new NotFoundError('Guardian not found');

  return StudentGuardian.findOneAndUpdate(
    { studentId, guardianId },
    { studentId, guardianId, ...linkData },
    { upsert: true, new: true }
  );
}

export async function listStudentGuardians(studentId, schoolId) {
  const student = await Student.findOne({ _id: studentId, schoolId });
  if (!student) throw new NotFoundError('Student not found');
  return StudentGuardian.find({ studentId }).populate('guardianId');
}

export async function getGuardian(id) {
  const g = await Guardian.findById(id);
  if (!g) throw new NotFoundError('Guardian not found');
  const obj = g.toObject();
  obj.aadhaarMasked = g.aadhaarLast4 ? `XXXX-XXXX-${g.aadhaarLast4}` : null;
  return obj;
}
