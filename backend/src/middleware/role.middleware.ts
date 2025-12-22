import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

/**
 * Role-Based Access Control Middleware
 *
 * Why it exists: Enforces role-based permissions on API routes,
 * ensuring users can only access resources they're authorized for.
 *
 * Security considerations:
 * - Granular permission control based on user roles
 * - Prevents privilege escalation attacks
 * - Clear separation between teacher and student capabilities
 *
 * Scalability concerns:
 * - Lightweight role checking without database calls
 * - Easy to extend with additional roles or permissions
 * - Centralized permission logic
 */

/**
 * Middleware factory to require specific roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NO_USER_INFO',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require teacher role
 */
export const requireTeacher = requireRole('teacher');

/**
 * Middleware to require student role
 */
export const requireStudent = requireRole('student');

/**
 * Middleware to allow either teacher or student role
 */
export const requireAuthenticated = requireRole('teacher', 'student');

/**
 * Middleware to check if user is the owner of a resource
 * Useful for resources where users can only access their own data
 */
export const requireOwnership = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NO_USER_INFO',
      });
      return;
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (!resourceUserId) {
      res.status(400).json({
        success: false,
        message: 'Resource user ID not found',
        error: 'MISSING_USER_ID',
      });
      return;
    }

    // Allow teachers to access any resource, students only their own
    if (req.user.role === 'student' && req.user.userId !== resourceUserId) {
      res.status(403).json({
        success: false,
        message: 'Access denied: can only access own resources',
        error: 'OWNERSHIP_VIOLATION',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is the teacher of an assignment
 * Used for assignment-specific operations
 */
export const requireAssignmentTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'NO_USER_INFO',
    });
    return;
  }

  try {
    const { Assignment } = await import('../models');
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!assignmentId) {
      res.status(400).json({
        success: false,
        message: 'Assignment ID required',
        error: 'MISSING_ASSIGNMENT_ID',
      });
      return;
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found',
        error: 'ASSIGNMENT_NOT_FOUND',
      });
      return;
    }

    // Check if user is the teacher who created the assignment
    if (assignment.teacherId.toString() !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied: not the assignment teacher',
        error: 'NOT_ASSIGNMENT_TEACHER',
      });
      return;
    }

    // Attach assignment to request for downstream use
    (req as any).assignment = assignment;

    next();
  } catch (error) {
    console.error('Assignment teacher check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    });
  }
};
