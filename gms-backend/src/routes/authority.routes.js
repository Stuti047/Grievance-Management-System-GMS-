import { Router } from 'express';
import { 
  listAuthorities, 
  createAuthority, 
  updateAuthority, 
  getAuthorityAuditLogs 
} from '../controllers/authority.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAuthoritySchema } from '../validators/admin.validator.js';

const router = Router();

router.get('/', listAuthorities);
router.get('/audit-logs', authenticate, authorize('admin'), getAuthorityAuditLogs);
router.post('/', authenticate, authorize('admin'), validate(createAuthoritySchema), createAuthority);
router.put('/:id', authenticate, authorize('admin'), updateAuthority);

export default router;
