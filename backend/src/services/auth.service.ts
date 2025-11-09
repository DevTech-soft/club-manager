import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import {
  JWT_SECRET,
  TOKEN_EXPIRATION,
  REFRESH_EXPIRATION,
} from '../config/constants';

/**
 * Service layer for Authentication
 * Contains all business logic related to authentication and authorization
 */

interface LoginCredentials {
  user: string;
  pass: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginResult {
  success: boolean;
  userType: 'admin' | 'superadmin' | 'coach';
  tokens: AuthTokens;
  coachInfo?: {
    id: string;
    firstName: string;
    lastName: string;
    document: string;
    avatarUrl: string;
  };
}

/**
 * Generate JWT tokens (access and refresh)
 */
const generateTokens = (payload: { id?: string; role: string }): AuthTokens => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRATION,
  });

  return { accessToken, refreshToken };
};

/**
 * Authenticate admin or superadmin (hardcoded for now)
 * TODO: In production, move to a users table with roles
 */
const authenticateAdmin = async (
  user: string,
  pass: string
): Promise<LoginResult | null> => {
  const isAdmin = user === 'admin' || user === 'superadmin';

  if (!isAdmin) {
    return null;
  }

  // Validate password
  const expectedPass = user === 'admin' ? 'password' : 'superpassword';
  if (pass !== expectedPass) {
    return null;
  }

  // Generate tokens
  const tokens = generateTokens({ role: user });

  return {
    success: true,
    userType: user as 'admin' | 'superadmin',
    tokens,
  };
};

/**
 * Authenticate coach from database
 */
const authenticateCoach = async (
  user: string,
  pass: string
): Promise<LoginResult | null> => {
  // Find coach by document
  const coach = await prisma.coach.findUnique({
    where: { document: user },
  });

  if (!coach) {
    return null;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(pass, coach.password);
  if (!isValidPassword) {
    return null;
  }

  // Generate tokens
  const tokens = generateTokens({ id: coach.id, role: 'coach' });

  // Remove password from response
  const { password, ...coachInfo } = coach;

  return {
    success: true,
    userType: 'coach',
    tokens,
    coachInfo,
  };
};

/**
 * Login user (admin, superadmin, or coach)
 * Returns tokens and user info if successful, null otherwise
 */
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResult | null> => {
  const { user, pass } = credentials;

  // Try admin authentication first
  const adminResult = await authenticateAdmin(user, pass);
  if (adminResult) {
    return adminResult;
  }

  // Try coach authentication
  const coachResult = await authenticateCoach(user, pass);
  if (coachResult) {
    return coachResult;
  }

  // No valid credentials found
  return null;
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = (refreshToken: string): string | null => {
  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    return null;
  }

  const newAccessToken = jwt.sign(
    { id: decoded.id, role: decoded.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );

  return newAccessToken;
};
