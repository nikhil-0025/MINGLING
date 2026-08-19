import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createRoomSchema } from '../utils/validators';
import {
  createRoom,
  joinRoomByCode,
  getRoom,
  getRoomMessages,
  generateRoomQR,
  leaveRoom,
} from '../controllers/room.controller';

const router: Router = Router();

router.use(authMiddleware);

router.post('/', validateBody(createRoomSchema), createRoom);
router.get('/:roomId', getRoom);
router.get('/:roomId/messages', getRoomMessages);
router.get('/:roomId/qr', generateRoomQR);
router.post('/join/:code', joinRoomByCode);
router.delete('/:roomId/leave', leaveRoom);

export default router;