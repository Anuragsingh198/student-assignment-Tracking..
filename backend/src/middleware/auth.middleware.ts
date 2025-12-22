import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { IJwtPayload, UserRole } from '../types';

/**
 * Authentication Middleware
 *
 * Why it exists: Protects API routes by verifying JWT tokens and attaching
 * user information to the request object for downstream use.
 *
 * Security considerations:
 * - Validates JWT tokens on every protected request
 * - Extracts user information from verified tokens
 * - Prevents unauthorized access to protected resources
 * - Handles token expiration gracefully
 *
 * Scalability concerns:
 * - Stateless authentication reduces database lookups
 * - Lightweight token verification
 * - Cached user data in request object
 */

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT access tokens
 * Extracts token from Authorization header (Bearer token)
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'MISSING_TOKEN',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token and extract payload
    const payload = AuthService.verifyAccessToken(token);

    // Check if user still exists (optional but recommended)
    const user = await AuthService.getUserById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Attach user information to request
    req.user = payload;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
      error: 'INVALID_TOKEN',
    });
  }
};

/**
 * Middleware to authenticate requests using refresh tokens
 * Used specifically for token refresh endpoint
 */
export const authenticateRefresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
        error: 'MISSING_REFRESH_TOKEN',
      });
      return;
    }

    // Verify refresh token
    const payload = AuthService.verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await AuthService.getUserById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Attach user information to request
    req.user = payload;

    next();
  } catch (error) {
    console.error('Refresh token authentication error:', error);

    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error: 'INVALID_REFRESH_TOKEN',
    });
  }
};
