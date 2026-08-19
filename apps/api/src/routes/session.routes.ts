import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createSessionSchema } from '../utils/validators';
import {
  createSession,
  getSession,
  updateNickname,
  deleteSession,
} from '../controllers/session.controller';

const router: Router = Router();

router.post('/', validateBody(createSessionSchema), createSession);
router.get('/me', authMiddleware, getSession);
router.patch('/me/nickname', authMiddleware, updateNickname);
router.delete('/me', authMiddleware, deleteSession);

export default router;