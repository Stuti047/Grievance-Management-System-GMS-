import { Router } from 'express';
import {
  createGrievance,
  listGrievances,
  getGrievanceById,
  getMine,
  updateStatus,
  reopenGrievance,
  deleteGrievance,
  trackByToken,
  checkDuplicates
} from '../controllers/grievance.controller.js';
import { addComment, addInternalNote, listComments } from '../controllers/comment.controller.js';
import { toggleSupport, removeSupport } from '../controllers/support.controller.js';
import { submitFeedback } from '../controllers/feedback.controller.js';
import { flagGrievance } from '../controllers/flag.controller.js';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { creationLimiter } from '../middleware/rateLimiter.js';
import {
  createGrievanceSchema,
  updateStatusSchema,
  reopenSchema,
  flagSchema
} from '../validators/grievance.validator.js';
import { addCommentSchema } from '../validators/comment.validator.js';
import { submitFeedbackSchema } from '../validators/feedback.validator.js';

const router = Router();

// Specialized lookup endpoints
router.get('/mine', authenticate, getMine);
router.get('/check-duplicates', checkDuplicates);
router.get('/track/:token', trackByToken);

// Core CRUD
router.post('/', authenticate, creationLimiter, validate(createGrievanceSchema), createGrievance);
router.get('/', optionalAuthenticate, listGrievances);
router.get('/:id', optionalAuthenticate, getGrievanceById);
router.put('/:id/status', authenticate, authorize('authority', 'admin'), validate(updateStatusSchema), updateStatus);
router.post('/:id/reopen', authenticate, validate(reopenSchema), reopenGrievance);
router.delete('/:id', authenticate, deleteGrievance);

// Community & interaction sub-resources
router.post('/:id/comments', authenticate, validate(addCommentSchema), addComment);
router.get('/:id/comments', optionalAuthenticate, listComments);
router.post('/:id/internal-notes', authenticate, authorize('authority', 'admin'), validate(addCommentSchema), addInternalNote);

router.post('/:id/upvote', authenticate, toggleSupport);
router.delete('/:id/upvote', authenticate, removeSupport);

router.post('/:id/feedback', authenticate, validate(submitFeedbackSchema), submitFeedback);
router.post('/:id/flag', authenticate, validate(flagSchema), flagGrievance);

export default router;
