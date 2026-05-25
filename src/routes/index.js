import { Router } from 'express';
import authRoutes from './auth.routes.js';
import paymentRoutes from './payment.routes.js';
import invoiceRoutes from './invoice.routes.js';
import schoolRoutes from './school.routes.js';
import organizationRoutes from './organization.routes.js';
import studentRoutes from './student.routes.js';
import parentRoutes from './parent.routes.js';
import ratingRoutes from './rating.routes.js';
import chapterRoutes from './chapter.routes.js';
import classroomRoutes from './classroom.routes.js';
import attendanceRoutes from './attendance.routes.js';
import academicRoutes from './academic.routes.js';
import notificationRoutes from './notification.routes.js';
import teacherRoutes from './teacher.routes.js';
import subjectRoutes from './subject.routes.js';
import feeRoutes from './fee.routes.js';
import examRoutes from './exam.routes.js';
import guardianRoutes from './guardian.routes.js';
import adminRoutes from './admin.routes.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/organizations', organizationRoutes);
router.use('/schools', schoolRoutes);
router.use('/students', studentRoutes);
router.use('/parents', parentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/subjects', subjectRoutes);
router.use('/fees', feeRoutes);
router.use('/exams', examRoutes);
router.use('/guardians', guardianRoutes);
router.use('/ratings', ratingRoutes);
router.use('/chapters', chapterRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/academics', academicRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);

router.post('/webhooks/razorpay', paymentController.razorpayWebhook);

export default router;
