import { Router } from 'express';
import * as chapterController from '../controllers/chapter.controller.js';
import { authenticate } from '../middleware/auth.js';
import { schoolApiStack } from '../middleware/tenantStacks.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createChapterSchema } from '../validators/rating.validator.js';

const router = Router();

router.use(schoolApiStack);

router.get('/', authorize('school.read'), chapterController.list);
router.get('/:id', authorize('school.read'), chapterController.get);
router.post('/', validate(createChapterSchema), authorize('school.manage'), chapterController.create);

export default router;
