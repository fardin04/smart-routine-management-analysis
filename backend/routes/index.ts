import Router from 'express';
import aiRoutes from './aiRoutes';
import authRoutes from './authRoutes';
import batchRoutes from './batchRoutes';
import courseRoutes from './courseRoutes';
import roomRoutes from './roomRoutes';
import routineRoutes from './routineRoutes';
import teacherRoutes from './teacherRoutes';

const router = Router();

router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);
router.use('/batches', batchRoutes);
router.use('/courses', courseRoutes);
router.use('/rooms', roomRoutes);
router.use('/routines', routineRoutes);
router.use('/teachers', teacherRoutes);

export default router;