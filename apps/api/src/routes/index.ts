import { Router } from 'express';
import sessionRoutes from './session.routes';
import roomRoutes from './room.routes';
import messageRoutes from './message.routes';
import fileRoutes from './file.routes';
import aiRoutes from './ai.routes';
import reportRoutes from './report.routes';
import adminRoutes from './admin.routes';
import healthRoutes from './health.routes';

const router: Router = Router();

router.use('/sessions', sessionRoutes);
router.use('/rooms', roomRoutes);
router.use('/messages', messageRoutes);
router.use('/files', fileRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/health', healthRoutes);

export default router;