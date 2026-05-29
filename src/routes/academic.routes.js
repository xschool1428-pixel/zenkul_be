import { Router } from 'express';
import * as academicController from '../controllers/academic.controller.js';
import { authenticate } from '../middleware/auth.js';
import { schoolApiStack } from '../middleware/tenantStacks.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  academicYearSchema,
  schoolClassSchema,
  sectionSchema,
} from '../validators/domain.validators.js';
import { createTermSchema } from '../validators/rating.validator.js';

const router = Router();

router.use(schoolApiStack);

router.get('/structure', authorize('school.read'), academicController.structure);
router.get('/years', authorize('school.read'), academicController.listYears);
router.get('/classes', authorize('school.read'), academicController.listClasses);
router.get('/classes/:classId/sections', authorize('school.read'), academicController.listSections);
router.post('/years', authorize('school.manage'), validate(academicYearSchema), academicController.createYear);
router.post('/classes', authorize('school.manage'), validate(schoolClassSchema), academicController.createClass);
router.post(
  '/classes/:classId/sections',
  authorize('school.manage'),
  validate(sectionSchema),
  academicController.createSection
);
router.post('/terms', validate(createTermSchema), authorize('school.manage'), academicController.createTerm);
router.get('/terms', authorize('school.read'), academicController.listTerms);

export default router;
