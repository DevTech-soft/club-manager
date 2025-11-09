import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// POST /api/auth/login - Login (admin, superadmin, or coach)
router.post('/login', authController.login);

// POST /api/auth/logout - Logout (clear cookies)
router.post('/logout', authController.logout);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refresh);

// GET /api/auth/me - Get current user info (requires authentication)
router.get('/me', authenticate, authController.me);

export default router;
