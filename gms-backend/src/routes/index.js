import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import grievanceRoutes from './grievance.routes.js';
import categoryRoutes from './category.routes.js';
import authorityRoutes from './authority.routes.js';
import feedbackRoutes from './feedback.routes.js';
import flagRoutes from './flag.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'MITS Grievance Management System (GMS) API',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/grievances', grievanceRoutes);
router.use('/categories', categoryRoutes);
router.use('/authorities', authorityRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/flags', flagRoutes);
router.use('/analytics', analyticsRoutes);

// Admin-specific aliases if requested by frontend
router.get('/admin/users', (req, res, next) => {
  req.url = '/';
  userRoutes(req, res, next);
});

export default router;
