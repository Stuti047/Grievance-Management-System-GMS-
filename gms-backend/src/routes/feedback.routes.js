import { Router } from 'express';
import { listFeedback } from '../controllers/feedback.controller.js';

const router = Router();

router.get('/', listFeedback);

export default router;
