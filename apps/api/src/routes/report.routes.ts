import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createReport } from '../controllers/report.controller';

const router: Router = Router();

router.use(authMiddleware);
router.post('/', createReport);

export default router;