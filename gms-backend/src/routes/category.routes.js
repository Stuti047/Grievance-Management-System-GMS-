import { Router } from 'express';
import { listCategories, createCategory } from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema } from '../validators/admin.validator.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, authorize('admin'), validate(createCategorySchema), createCategory);

export default router;
