import { Router } from 'express';
import { listFlags, resolveFlag } from '../controllers/flag.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), listFlags);
router.put('/:id/resolve', authenticate, authorize('admin'), resolveFlag);

export default router;
