import { Request, Response } from 'express';
import { Assignment, IAssignmentDocument } from '../models';
import { IApiResponse, IPaginatedResponse, IAssignment } from '../types';
import { asyncHandler, AppError } from '../middleware/error.middleware';

export const createAssignment = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { title, description, dueDate, allowedSubmissionType, maxScore } = req.body;

  const assignment = new Assignment({
    title,
    description,
    teacherId: req.user.userId,
    dueDate: new Date(dueDate),
    allowedSubmissionType,
    maxScore,
    isPublished: false,
  });

  await assignment.save();

  res.status(201).json({
    success: true,
    message: 'Assignment created successfully',
    data: assignment,
  });
});

export const getAssignments = asyncHandler(async (
  req: Request,
  res: Response<IPaginatedResponse<IAssignmentDocument>>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  let query: any = {};

  if (req.user.role === 'teacher') {
    query.teacherId = req.user.userId;
  } else {
    query.isPublished = true;
  }

  const assignments = await Assignment.find(query)
    .populate('teacherId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Assignment.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: assignments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

export const getAssignment = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { id } = req.params;

  const assignment = await Assignment.findById(id).populate('teacherId', 'name email');

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (req.user.role === 'student' && !assignment.isPublished) {
    throw new AppError('Assignment not available', 404);
  }

  if (req.user.role === 'teacher' && assignment.teacherId.toString() !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  res.status(200).json({
    success: true,
    data: assignment,
  });
});

export const updateAssignment = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { id } = req.params;
  const updates = req.body;

  const assignment = await Assignment.findById(id);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (assignment.teacherId.toString() !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  if (updates.isPublished === true && !assignment.isPublished) {
  } else if (assignment.isPublished) {
    const { Submission } = await import('../models');
    const submissionCount = await Submission.countDocuments({ assignmentId: id });
    if (submissionCount > 0) {
      throw new AppError('Cannot update assignment that has submissions', 400);
    }
  }

  Object.assign(assignment, updates);
  await assignment.save();

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: assignment,
  });
});

export const deleteAssignment = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { id } = req.params;

  const assignment = await Assignment.findById(id);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (assignment.teacherId.toString() !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  const { Submission } = await import('../models');
  const submissionCount = await Submission.countDocuments({ assignmentId: id });
  if (submissionCount > 0) {
    throw new AppError('Cannot delete assignment that has submissions', 400);
  }

  await Assignment.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully',
  });
});

export const publishAssignment = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { id } = req.params;

  const assignment = await Assignment.findById(id);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (assignment.teacherId.toString() !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  assignment.isPublished = true;
  await assignment.save();

  res.status(200).json({
    success: true,
    message: 'Assignment published successfully',
    data: assignment,
  });
});

export const unpublishAssignment = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { id } = req.params;

  const assignment = await Assignment.findById(id);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (assignment.teacherId.toString() !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  const { Submission } = await import('../models');
  const submissionCount = await Submission.countDocuments({ assignmentId: id });
  if (submissionCount > 0) {
    throw new AppError('Cannot unpublish assignment that has submissions', 400);
  }

  assignment.isPublished = false;
  await assignment.save();

  res.status(200).json({
    success: true,
    message: 'Assignment unpublished successfully',
    data: assignment,
  });
});
