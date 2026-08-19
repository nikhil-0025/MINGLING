import { Router } from 'express';
import { adminMiddleware } from '../middleware/admin.middleware';
import {
  getDashboardStats,
  getRooms,
  deleteRoom,
  getUsers,
  blockUser,
  getReports,
  resolveReport,
  getServerStatus,
} from '../controllers/admin.controller';

const router: Router = Router();

router.use(adminMiddleware);

router.get('/stats', getDashboardStats);
router.get('/rooms', getRooms);
router.delete('/rooms/:roomId', deleteRoom);
router.get('/users', getUsers);
router.post('/users/:sessionId/block', blockUser);
router.get('/reports', getReports);
router.patch('/reports/:reportId', resolveReport);
router.get('/server-status', getServerStatus);

export default router;