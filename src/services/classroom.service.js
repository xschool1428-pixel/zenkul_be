import {
  Classroom,
  ClassroomMember,
  ClassroomInvite,
  ClassroomMaterial,
  ClassroomSubmission,
  Student,
  StudentEnrollment,
  Teacher,
} from '../models/index.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { emitToSchool, emitToUser } from './socket.service.js';
import { notifyUser } from './notification.service.js';

async function uniqueInviteCode(schoolId) {
  for (let i = 0; i < 10; i++) {
    const code = generateInviteCode(8);
    const exists = await Classroom.findOne({ schoolId, inviteCode: code, deletedAt: null });
    if (!exists) return code;
  }
  throw new BadRequestError('Could not generate invite code');
}

export async function createClassroom(schoolId, data, userId) {
  const teacher = await Teacher.findOne({ _id: data.primaryTeacherId, schoolId });
  if (!teacher) throw new NotFoundError('Teacher not found');

  const inviteCode = data.inviteCode?.toUpperCase() || (await uniqueInviteCode(schoolId));

  const classroom = await Classroom.create({
    schoolId,
    academicYearId: data.academicYearId,
    sessionId: data.sessionId,
    schoolClassId: data.schoolClassId,
    sectionId: data.sectionId,
    name: data.name,
    description: data.description,
    inviteCode,
    primaryTeacherId: data.primaryTeacherId,
    createdByUserId: userId,
  });

  emitToSchool(String(schoolId), 'classroom:created', { classroomId: classroom._id, name: classroom.name });
  return classroom;
}

export async function syncStudentsFromEnrollment(classroomId, schoolId) {
  const classroom = await Classroom.findOne({ _id: classroomId, schoolId, deletedAt: null });
  if (!classroom) throw new NotFoundError('Classroom not found');

  const enrollments = await StudentEnrollment.find({
    academicYearId: classroom.academicYearId,
    schoolClassId: classroom.schoolClassId,
    sectionId: classroom.sectionId,
    status: 'active',
  });

  let added = 0;
  for (const enr of enrollments) {
    const student = await Student.findById(enr.studentId);
    if (!student) continue;
    const exists = await ClassroomMember.findOne({ classroomId, studentId: student._id });
    if (exists) continue;
    await ClassroomMember.create({
      classroomId,
      studentId: student._id,
      userId: student.userId,
    });
    added++;
    if (student.userId) {
      emitToUser(String(student.userId), 'classroom:joined', { classroomId, name: classroom.name });
    }
  }
  return { added, total: enrollments.length };
}

export async function createInvite(classroomId, schoolId, { email, studentId, expiresInDays }, userId) {
  const classroom = await Classroom.findOne({ _id: classroomId, schoolId });
  if (!classroom) throw new NotFoundError('Classroom not found');

  const code = generateInviteCode(10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 14));

  const invite = await ClassroomInvite.create({
    classroomId,
    inviteCode: code,
    email,
    studentId,
    invitedByUserId: userId,
    expiresAt,
  });

  return { invite, classroomInviteCode: classroom.inviteCode, personalInviteCode: code };
}

export async function joinClassroomByCode({ inviteCode, userId, studentId }) {
  const code = inviteCode?.toUpperCase()?.trim();
  if (!code) throw new BadRequestError('inviteCode required');

  let classroom = await Classroom.findOne({ inviteCode: code, deletedAt: null, status: 'active' });
  let invite = null;

  if (!classroom) {
    invite = await ClassroomInvite.findOne({ inviteCode: code, status: 'pending' });
    if (!invite) throw new NotFoundError('Invalid or expired invite code');
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      throw new BadRequestError('Invite expired');
    }
    classroom = await Classroom.findById(invite.classroomId);
    if (!classroom || classroom.deletedAt) throw new NotFoundError('Classroom not found');
  }

  let student = studentId ? await Student.findById(studentId) : null;
  if (!student && userId) {
    const { Guardian, StudentGuardian } = await import('../models/index.js');
    const guardian = await Guardian.findOne({ userId });
    if (guardian) {
      const link = await StudentGuardian.findOne({ guardianId: guardian._id });
      if (link) student = await Student.findById(link.studentId);
    }
    if (!student) student = await Student.findOne({ userId, schoolId: classroom.schoolId });
  }

  if (!student) throw new BadRequestError('studentId required or link student to your account');

  if (invite?.studentId && !invite.studentId.equals(student._id)) {
    throw new ForbiddenError('This invite is for another student');
  }

  const enrollment = await StudentEnrollment.findOne({
    studentId: student._id,
    academicYearId: classroom.academicYearId,
    schoolClassId: classroom.schoolClassId,
    sectionId: classroom.sectionId,
    status: 'active',
  });
  if (!enrollment) {
    throw new BadRequestError('Student is not enrolled in this class/section for the classroom academic year');
  }

  const member = await ClassroomMember.findOneAndUpdate(
    { classroomId: classroom._id, studentId: student._id },
    {
      classroomId: classroom._id,
      studentId: student._id,
      userId: student.userId || userId,
      status: 'active',
    },
    { upsert: true, new: true }
  );

  if (invite) {
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    invite.acceptedByUserId = userId;
    await invite.save();
  }

  if (student.userId) {
    emitToUser(String(student.userId), 'classroom:joined', { classroomId: classroom._id, name: classroom.name });
  }

  return { classroom, member };
}

export async function createMaterial(classroomId, schoolId, data, userId) {
  const classroom = await Classroom.findOne({ _id: classroomId, schoolId });
  if (!classroom) throw new NotFoundError('Classroom not found');

  if (['homework', 'assignment'].includes(data.materialType) && !data.dueAt) {
    throw new BadRequestError('dueAt is required for homework and assignment');
  }

  const material = await ClassroomMaterial.create({
    classroomId,
    schoolId,
    subjectId: data.subjectId,
    materialType: data.materialType,
    title: data.title,
    content: data.content,
    chapterId: data.chapterId,
    chapter: data.chapter,
    topic: data.topic,
    attachments: data.attachments || [],
    dueAt: data.dueAt,
    isPinned: data.isPinned || data.materialType === 'important',
    isImportant: data.isImportant || ['important', 'revision'].includes(data.materialType),
    status: data.status || 'published',
    publishedAt: data.status === 'draft' ? null : new Date(),
    createdByUserId: userId,
  });

  const members = await ClassroomMember.find({ classroomId, status: 'active' }).populate('studentId');
  for (const m of members) {
    const uid = m.userId || m.studentId?.userId;
    if (uid) {
      emitToUser(String(uid), 'classroom:material', {
        classroomId,
        materialId: material._id,
        materialType: material.materialType,
        title: material.title,
        isImportant: material.isImportant,
      });
      await notifyUser({
        userId: uid,
        schoolId,
        title: `New ${material.materialType}: ${material.title}`,
        body: material.content.slice(0, 200),
        payload: { classroomId, materialId: material._id },
      });
    }
  }

  emitToSchool(String(schoolId), 'classroom:material', {
    classroomId,
    materialId: material._id,
    materialType: material.materialType,
  });

  return material;
}

export async function listMaterials(classroomId, filters = {}) {
  const query = { classroomId, status: filters.status || 'published' };
  if (filters.materialType) query.materialType = filters.materialType;
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.isImportant != null) query.isImportant = filters.isImportant === 'true';

  return ClassroomMaterial.find(query)
    .populate('subjectId', 'code name')
    .populate('createdByUserId', 'firstName lastName')
    .sort({ isPinned: -1, publishedAt: -1 });
}

export async function getClassroom(classroomId, schoolId) {
  const classroom = await Classroom.findOne({ _id: classroomId, schoolId, deletedAt: null })
    .populate('primaryTeacherId', 'employeeCode')
    .populate('schoolClassId sectionId academicYearId', 'name');
  if (!classroom) throw new NotFoundError('Classroom not found');
  const memberCount = await ClassroomMember.countDocuments({ classroomId, status: 'active' });
  return { ...classroom.toObject(), memberCount };
}

export async function listClassrooms(schoolId, filters = {}) {
  const q = { schoolId, deletedAt: null };
  if (filters.academicYearId) q.academicYearId = filters.academicYearId;
  if (filters.schoolClassId) q.schoolClassId = filters.schoolClassId;
  if (filters.sectionId) q.sectionId = filters.sectionId;
  return Classroom.find(q).sort({ createdAt: -1 });
}

export async function listClassroomsForUser(userId, schoolId) {
  const { Guardian, StudentGuardian } = await import('../models/index.js');
  const guardian = await Guardian.findOne({ userId });
  const studentIds = [];

  if (guardian) {
    const links = await StudentGuardian.find({ guardianId: guardian._id });
    studentIds.push(...links.map((l) => l.studentId));
  }
  const ownStudent = await Student.find({ userId, ...(schoolId ? { schoolId } : {}) });
  studentIds.push(...ownStudent.map((s) => s._id));

  const memberRooms = await ClassroomMember.find({
    studentId: { $in: studentIds },
    status: 'active',
  }).populate({
    path: 'classroomId',
    match: { deletedAt: null, ...(schoolId ? { schoolId } : {}) },
  });

  const teacher = await Teacher.findOne({ userId, ...(schoolId ? { schoolId } : {}) });
  let teacherRooms = [];
  if (teacher) {
    teacherRooms = await Classroom.find({
      ...(schoolId ? { schoolId } : {}),
      primaryTeacherId: teacher._id,
      deletedAt: null,
    });
  }

  const asStudent = memberRooms.filter((m) => m.classroomId).map((m) => ({ ...m.classroomId.toObject(), role: 'student' }));
  const asTeacher = teacherRooms.map((c) => ({ ...c.toObject(), role: 'teacher' }));

  return { asStudent, asTeacher };
}

export async function submitHomework(materialId, studentId, data, userId) {
  const material = await ClassroomMaterial.findById(materialId);
  if (!material) throw new NotFoundError('Material not found');
  if (!['homework', 'assignment'].includes(material.materialType)) {
    throw new BadRequestError('Submissions only for homework/assignment');
  }

  const member = await ClassroomMember.findOne({
    classroomId: material.classroomId,
    studentId,
    status: 'active',
  });
  if (!member) throw new ForbiddenError('Not a member of this classroom');

  const isLate = material.dueAt && new Date() > new Date(material.dueAt);

  const submission = await ClassroomSubmission.findOneAndUpdate(
    { materialId, studentId },
    {
      materialId,
      studentId,
      content: data.content,
      attachments: data.attachments,
      submittedAt: new Date(),
      status: isLate ? 'late' : 'submitted',
    },
    { upsert: true, new: true }
  );

  emitToSchool(String(material.schoolId), 'classroom:submission', {
    materialId,
    studentId,
    submissionId: submission._id,
  });

  return submission;
}
