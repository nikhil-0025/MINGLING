import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  chatAssistant,
  summarizeMessages,
  smartReplies,
  grammarFix,
  translateText,
} from '../controllers/ai.controller';

const router: Router = Router();

router.use(authMiddleware);

router.post('/chat', chatAssistant);
router.post('/summarize', summarizeMessages);
router.post('/smart-replies', smartReplies);
router.post('/grammar', grammarFix);
router.post('/translate', translateText);

export default router;