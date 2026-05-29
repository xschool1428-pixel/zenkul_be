import { Router } from 'express';
import * as classroomController from '../controllers/classroom.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireSchoolContext, assertSchoolAccess } from '../middleware/tenant.js';
import { requireOrganizationSubscription } from '../middleware/requireOrganizationSubscription.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';
import { CLASSROOM_MATERIAL_TYPES, MATERIAL_PUBLISH_STATUS } from '../constants/enums.js';

const createClassroomSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    academicYearId: Joi.string().required(),
    sessionId: Joi.string(),
    schoolClassId: Joi.string().required(),
    sectionId: Joi.string().required(),
    primaryTeacherId: Joi.string().required(),
    inviteCode: Joi.string().max(20),
  }).required(),
});

const materialSchema = Joi.object({
  body: Joi.object({
    subjectId: Joi.string().required(),
    materialType: Joi.string()
      .valid(...CLASSROOM_MATERIAL_TYPES)
      .required(),
    title: Joi.string().required(),
    content: Joi.string().required(),
    chapterId: Joi.string(),
    chapter: Joi.string(),
    topic: Joi.string(),
    attachments: Joi.array(),
    dueAt: Joi.date(),
    isPinned: Joi.boolean(),
    isImportant: Joi.boolean(),
    status: Joi.string().valid(...MATERIAL_PUBLISH_STATUS),
  }).required(),
});

const router = Router();

router.use(authenticate);

router.get('/my', classroomController.myClassrooms);
router.post('/join', classroomController.join);

router.use(requireSchoolContext, assertSchoolAccess, requireOrganizationSubscription);

router.get('/', authorize('classroom.read'), classroomController.list);
router.get('/:id', authorize('classroom.read'), classroomController.get);
router.post('/', validate(createClassroomSchema), authorize('classroom.create'), classroomController.create);
router.post('/:id/sync-members', authorize('classroom.manage'), classroomController.syncMembers);
router.post('/:id/invites', authorize('classroom.manage'), classroomController.createInvite);
router.post(
  '/:id/materials',
  validate(materialSchema),
  authorize('classroom.material'),
  classroomController.postMaterial
);
router.get('/:id/materials', authorize('classroom.read'), classroomController.listMaterials);
router.post('/materials/:materialId/submit', classroomController.submitHomework);

export default router;
