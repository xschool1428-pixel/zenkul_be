import * as classroomService from '../services/classroom.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const data = await classroomService.listClassrooms(req.schoolId, req.query);
  res.json({ success: true, data });
});

export const get = asyncHandler(async (req, res) => {
  const data = await classroomService.getClassroom(req.params.id, req.schoolId);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await classroomService.createClassroom(req.schoolId, req.body, req.userId);
  res.status(201).json({ success: true, data });
});

export const syncMembers = asyncHandler(async (req, res) => {
  const data = await classroomService.syncStudentsFromEnrollment(req.params.id, req.schoolId);
  res.json({ success: true, data });
});

export const createInvite = asyncHandler(async (req, res) => {
  const data = await classroomService.createInvite(
    req.params.id,
    req.schoolId,
    req.body,
    req.userId
  );
  res.status(201).json({ success: true, data });
});

export const join = asyncHandler(async (req, res) => {
  const data = await classroomService.joinClassroomByCode({
    inviteCode: req.body.inviteCode,
    userId: req.userId,
    studentId: req.body.studentId,
  });
  res.json({ success: true, data });
});

export const postMaterial = asyncHandler(async (req, res) => {
  const data = await classroomService.createMaterial(
    req.params.id,
    req.schoolId,
    req.body,
    req.userId
  );
  res.status(201).json({ success: true, data });
});

export const listMaterials = asyncHandler(async (req, res) => {
  const data = await classroomService.listMaterials(req.params.id, req.query);
  res.json({ success: true, data });
});

export const myClassrooms = asyncHandler(async (req, res) => {
  const data = await classroomService.listClassroomsForUser(req.userId, req.schoolId || req.query.schoolId);
  res.json({ success: true, data });
});

export const submitHomework = asyncHandler(async (req, res) => {
  const data = await classroomService.submitHomework(
    req.params.materialId,
    req.body.studentId,
    req.body,
    req.userId
  );
  res.status(201).json({ success: true, data });
});
