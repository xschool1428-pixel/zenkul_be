import { Router } from 'express';
import * as parentController from '../controllers/parent.controller.js';
import { authenticate } from '../middleware/auth.js';
import { loadParentContext } from '../middleware/parentAccess.js';

const router = Router();

router.use(authenticate, loadParentContext);

router.get('/dashboard', parentController.dashboard);
router.get('/children/:studentId', ...parentController.childDetail);

export default router;
