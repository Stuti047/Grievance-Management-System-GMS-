import { Router } from 'express';
import {
  listAuthorities,
  createAuthority,
  updateAuthority,
  toggleAuthorityStatus,
  mapCategoryToAuthority,
  getAuditLogs
} from '../controllers/authority.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// List authorities (Students see names/departments; Admins see confidential contact numbers)
router.get('/', optionalAuthenticate, listAuthorities);

// Admin operations on authorities directory
router.post('/', authenticate, authorize('admin'), createAuthority);
router.put('/:id', authenticate, authorize('admin'), updateAuthority);
router.patch('/:id/status', authenticate, authorize('admin'), toggleAuthorityStatus);

// Category-to-Authority mapping
router.post('/map-category', authenticate, authorize('admin'), mapCategoryToAuthority);

// Audit logs
router.get('/audit-logs', authenticate, authorize('admin'), getAuditLogs);

export default router;
