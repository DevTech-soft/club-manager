import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '../config/constants';

/**
 * Controller layer for Authentication
 * Handles HTTP requests and responses for authentication
 */

/**
 * POST /api/auth/login
 * Login endpoint for admin, superadmin, and coach users
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, pass } = req.body;

    // Validate request body
    if (!user || !pass) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Authenticate user
    const result = await authService.login({ user, pass });

    if (!result) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set secure HTTP-only cookies
    res.cookie('accessToken', result.tokens.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', result.tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    // Return user info (without tokens in response body for security)
    const response: any = {
      success: true,
      userType: result.userType,
    };

    if (result.coachInfo) {
      response.coachInfo = result.coachInfo;
    }

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Logout endpoint - clears authentication cookies
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const newAccessToken = authService.refreshAccessToken(refreshToken);

    if (!newAccessToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Update access token cookie
    res.cookie('accessToken', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.json({ success: true, message: 'Access token refreshed' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User info is set by authenticate middleware in req.user
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
      id: req.user.id,
      role: req.user.role,
    });
  } catch (error) {
    next(error);
  }
};
