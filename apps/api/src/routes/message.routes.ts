import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getMessages, searchMessages } from '../controllers/message.controller';

const router: Router = Router();

router.use(authMiddleware);

router.get('/room/:roomId', getMessages);
router.get('/room/:roomId/search', searchMessages);

export default router;