import { z } from 'zod';

/**
 * Input Validation Schemas using Zod
 *
 * Why it exists: Provides type-safe input validation for all API endpoints,
 * preventing invalid data from reaching business logic.
 *
 * Security considerations:
 * - Prevents injection attacks through input sanitization
 * - Validates data types and constraints
 * - Provides clear error messages without exposing internals
 *
 * Scalability concerns:
 * - Centralized validation logic
 * - Easy to maintain and extend
 * - Type inference for TypeScript types
 */

// Auth validation schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8).max(128),
    role: z.string().transform(val => val.toLowerCase()).pipe(z.enum(['student', 'teacher'])),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(1),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

// Assignment validation schemas
export const createAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).trim(),
    description: z.string().min(10).max(5000).trim(),
    dueDate: z.string().datetime(), // ISO string
    allowedSubmissionType: z.enum(['TEXT', 'FILE']),
    maxScore: z.number().min(0).max(1000),
  }),
});

export const updateAssignmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignment ID'),
  }),
  body: z.object({
    title: z.string().min(3).max(200).trim().optional(),
    description: z.string().min(10).max(5000).trim().optional(),
    dueDate: z.string().datetime().optional(),
    allowedSubmissionType: z.enum(['TEXT', 'FILE']).optional(),
    maxScore: z.number().min(0).max(1000).optional(),
    isPublished: z.boolean().optional(),
  }),
});

// Submission validation schemas
export const createSubmissionSchema = z.object({
  params: z.object({
    assignmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignment ID'),
  }),
  body: z.object({
    content: z.string().max(10000).trim().optional(),
  }),
});

export const getSubmissionsSchema = z.object({
  params: z.object({
    assignmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignment ID'),
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});

// Evaluation validation schemas
export const evaluateSubmissionSchema = z.object({
  params: z.object({
    submissionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid submission ID'),
  }),
  body: z.object({
    score: z.number().min(0),
    comments: z.string().min(10).max(2000).trim(),
  }),
});

// Rubric validation schemas
export const createRubricSchema = z.object({
  params: z.object({
    assignmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignment ID'),
  }),
  body: z.object({
    criteria: z.array(
      z.object({
        name: z.string().min(2).max(100).trim(),
        maxScore: z.number().min(0).max(100),
        description: z.string().min(10).max(500).trim(),
      })
    ).min(1).max(20),
  }),
});

// Generic ID validation
export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
});

// Pagination schema
export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type EvaluateSubmissionInput = z.infer<typeof evaluateSubmissionSchema>;
export type CreateRubricInput = z.infer<typeof createRubricSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
