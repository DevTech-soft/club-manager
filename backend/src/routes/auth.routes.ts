import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';
import { loginSchema } from '../validators/coach.validator';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// POST /api/auth/login - Login (con rate limiting)
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  authController.login
);

// POST /api/auth/logout - Logout (clear cookies)
router.post('/logout', authController.logout);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refresh);

// GET /api/auth/me - Get current user info (requires authentication)
router.get('/me', authenticate, authController.me);

export default router;
