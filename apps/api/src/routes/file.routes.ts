import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { uploadFile } from '../controllers/file.controller';

const router: Router = Router();

router.use(authMiddleware);
router.post('/upload', uploadMiddleware.single('file'), uploadFile);

export default router;