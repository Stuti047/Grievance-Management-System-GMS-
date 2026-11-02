import { Router } from 'express';
import { getProfile, updateProfile, listUsers, setUserStatus } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/auth.validator.js';
import { setUserStatusSchema } from '../validators/admin.validator.js';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.get('/', authenticate, authorize('admin'), listUsers);
router.put('/:id/status', authenticate, authorize('admin'), validate(setUserStatusSchema), setUserStatus);

export default router;
