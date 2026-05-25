import {
  Student,
  StudentProfile,
  StudentEnrollment,
  StudentGuardian,
  Guardian,
  School,
} from '../models/index.js';
import { encryptAadhaar, aadhaarLast4, maskAadhaar } from '../utils/aadhaar.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { writeAudit } from './audit.service.js';
import { emitToSchool } from './socket.service.js';

export function formatStudentProfile(profile, includeAadhaar = false) {
  if (!profile) return null;
  const obj = profile.toObject ? profile.toObject() : { ...profile };
  delete obj.aadhaarEncrypted;
  obj.aadhaarMasked = maskAadhaar(obj.aadhaarLast4);
  if (!includeAadhaar) return obj;
  return obj;
}

export async function createStudent(schoolId, data, actorUserId, req) {
  const student = await Student.create({
    schoolId,
    userId: data.userId,
    admissionNumber: data.admissionNumber,
    admissionDate: data.admissionDate || new Date(),
    status: 'active',
  });

  if (data.profile) {
    const profileData = { studentId: student._id, ...data.profile };
    if (data.profile.aadhaar) {
      profileData.aadhaarEncrypted = encryptAadhaar(data.profile.aadhaar);
      profileData.aadhaarLast4 = aadhaarLast4(data.profile.aadhaar);
      delete profileData.aadhaar;
    }
    await StudentProfile.create(profileData);
  }

  if (data.enrollment) {
    await StudentEnrollment.create({
      studentId: student._id,
      ...data.enrollment,
      enrollmentDate: data.enrollment.enrollmentDate || new Date(),
    });
  }

  if (data.guardian) {
    let guardian = await Guardian.findOne({ phone: data.guardian.phone });
    if (!guardian) {
      guardian = await Guardian.create(data.guardian);
      if (data.guardian.aadhaar) {
        guardian.aadhaarEncrypted = encryptAadhaar(data.guardian.aadhaar);
        guardian.aadhaarLast4 = aadhaarLast4(data.guardian.aadhaar);
        await guardian.save();
      }
    }
    await StudentGuardian.create({
      studentId: student._id,
      guardianId: guardian._id,
      relationship: data.guardian.relationship || 'guardian',
      isPrimary: true,
    });
  }

  await writeAudit({
    schoolId,
    actorUserId,
    action: 'create',
    entityType: 'student',
    entityId: student._id,
    afterState: { admissionNumber: student.admissionNumber },
    req,
  });

  emitToSchool(String(schoolId), 'student:created', { studentId: student._id });

  return student;
}

export async function updateStudentAadhaar(studentId, aadhaar, actorUserId, req) {
  const student = await Student.findById(studentId);
  if (!student) throw new NotFoundError('Student not found');

  let profile = await StudentProfile.findOne({ studentId });
  if (!profile) {
    profile = new StudentProfile({ studentId });
  }

  profile.aadhaarEncrypted = encryptAadhaar(aadhaar);
  profile.aadhaarLast4 = aadhaarLast4(aadhaar);
  await profile.save();

  await writeAudit({
    schoolId: student.schoolId,
    actorUserId,
    action: 'update_aadhaar',
    entityType: 'student_profile',
    entityId: studentId,
    afterState: { aadhaarLast4: profile.aadhaarLast4 },
    req,
  });

  return formatStudentProfile(profile);
}

export async function getStudent(schoolId, studentId) {
  const student = await Student.findOne({ _id: studentId, schoolId, deletedAt: null });
  if (!student) throw new NotFoundError('Student not found');
  const profile = await StudentProfile.findOne({ studentId });
  const enrollment = await StudentEnrollment.findOne({ studentId, status: 'active' })
    .populate('academicYearId schoolClassId sectionId');
  const guardians = await StudentGuardian.find({ studentId }).populate('guardianId');
  return {
    ...student.toObject(),
    profile: formatStudentProfile(profile),
    currentEnrollment: enrollment,
    guardians,
  };
}

export async function updateStudent(schoolId, studentId, data, actorUserId, req) {
  const student = await Student.findOne({ _id: studentId, schoolId, deletedAt: null });
  if (!student) throw new NotFoundError('Student not found');

  const { profile, ...studentFields } = data;
  if (Object.keys(studentFields).length) {
    Object.assign(student, studentFields);
    await student.save();
  }

  if (profile) {
    const profileData = { ...profile };
    if (profile.aadhaar) {
      profileData.aadhaarEncrypted = encryptAadhaar(profile.aadhaar);
      profileData.aadhaarLast4 = aadhaarLast4(profile.aadhaar);
      delete profileData.aadhaar;
    }
    await StudentProfile.findOneAndUpdate({ studentId }, profileData, { upsert: true, new: true });
  }

  await writeAudit({
    schoolId,
    actorUserId,
    action: 'update',
    entityType: 'student',
    entityId: studentId,
    req,
  });

  return getStudent(schoolId, studentId);
}

export async function listStudents(schoolId, filters = {}) {
  const { paginate } = await import('../utils/pagination.js');
  const query = { schoolId, deletedAt: null };
  if (filters.status) query.status = filters.status;

  const { items: students, meta } = await paginate(Student, query, filters);
  const ids = students.map((s) => s._id);
  const profiles = await StudentProfile.find({ studentId: { $in: ids } });
  const profileMap = Object.fromEntries(profiles.map((p) => [String(p.studentId), p]));

  const data = students.map((s) => ({
    ...s.toObject(),
    profile: formatStudentProfile(profileMap[String(s._id)]),
  }));

  return { data, meta };
}
