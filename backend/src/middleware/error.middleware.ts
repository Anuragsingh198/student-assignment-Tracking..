import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { config } from '../config/config';

/**
 * Centralized Error Handling Middleware
 *
 * Why it exists: Provides consistent error responses across the application,
 * handles different types of errors appropriately, and prevents sensitive
 * information leakage.
 *
 * Security considerations:
 * - Sanitizes error messages for production
 * - Prevents stack trace exposure
 * - Handles validation errors safely
 *
 * Scalability concerns:
 * - Centralized logging for monitoring
 * - Consistent response format
 * - Easy to extend for new error types
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';

  // Log error for debugging (only in development)
  if (config.NODE_ENV === 'development') {
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      userId: req.user?.userId,
    });
  }

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorCode = 'APP_ERROR';
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errorCode = 'VALIDATION_ERROR';
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Database validation failed';
    errorCode = 'DB_VALIDATION_ERROR';
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid data format';
    errorCode = 'INVALID_FORMAT';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  } else if (error.message.includes('User with this email already exists')) {
    statusCode = 409;
    message = error.message;
    errorCode = 'USER_EXISTS';
  } else if (error.message.includes('Invalid email or password')) {
    statusCode = 401;
    message = error.message;
    errorCode = 'INVALID_CREDENTIALS';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    ...(config.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error.message,
    }),
  });
};

/**
 * Async error wrapper to catch promise rejections
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found middleware
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Validation middleware factory
 */
export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request parts based on schema
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
