import { Router } from 'express';
import * as ratingController from '../controllers/rating.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireSchoolContext, assertSchoolAccess } from '../middleware/tenant.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createRatingSchema,
  updateRatingSchema,
  listRatingQuerySchema,
} from '../validators/rating.validator.js';

const router = Router();

router.use(authenticate);

router.get('/student/:studentId', validate(listRatingQuerySchema), ratingController.listByStudent);
router.get(
  '/student/:studentId/summary',
  validate(listRatingQuerySchema),
  ratingController.summary
);

router.use(requireSchoolContext, assertSchoolAccess);

router.get('/', validate(listRatingQuerySchema), authorize('rating.read'), ratingController.list);
router.get(
  '/class/:classId/section/:sectionId',
  validate(listRatingQuerySchema),
  authorize('rating.read'),
  ratingController.listByClassSection
);
router.post('/', validate(createRatingSchema), authorize('rating.create'), ratingController.create);
router.patch('/:id', validate(updateRatingSchema), authorize('rating.create'), ratingController.update);

export default router;
