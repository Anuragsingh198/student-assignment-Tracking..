import { Request, Response } from 'express';
import { Submission, Feedback, Assignment } from '../models';
import { IApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/error.middleware';

export const evaluateSubmission = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { submissionId } = req.params;
  const { score, comments } = req.body;

  const submission = await Submission.findById(submissionId)
    .populate('assignmentId')
    .populate('studentId', 'name email');

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  const assignment = submission.assignmentId as any;
  if (assignment.teacherId.toString() !== req.user.userId) {
    throw new AppError('Access denied: not the assignment teacher', 403);
  }

  if (submission.status === 'EVALUATED') {
    throw new AppError('Submission has already been evaluated', 400);
  }

  if (score > assignment.maxScore) {
    throw new AppError(`Score cannot exceed maximum score of ${assignment.maxScore}`, 400);
  }

  submission.score = score;
  submission.status = 'EVALUATED';
  await submission.save();

  const feedback = new Feedback({
    submissionId,
    teacherId: req.user.userId,
    comments,
  });

  await feedback.save();

  await feedback.populate('teacherId', 'name email');

  res.status(200).json({
    success: true,
    message: 'Submission evaluated successfully',
    data: {
      submission,
      feedback,
    },
  });
});

export const getSubmissionFeedback = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { submissionId } = req.params;

  const feedback = await Feedback.findOne({ submissionId })
    .populate('submissionId')
    .populate('teacherId', 'name email');

  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  const submission = feedback.submissionId as any;

  if (req.user.role === 'student') {
    if (submission.studentId.toString() !== req.user.userId) {
      throw new AppError('Access denied', 403);
    }
  } else if (req.user.role === 'teacher') {
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment || assignment.teacherId.toString() !== req.user.userId) {
      throw new AppError('Access denied', 403);
    }
  }

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

export const updateFeedback = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { submissionId } = req.params;
  const { comments } = req.body;

  const feedback = await Feedback.findOne({ submissionId });
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  if (feedback.teacherId.toString() !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  feedback.comments = comments;
  await feedback.save();

  res.status(200).json({
    success: true,
    message: 'Feedback updated successfully',
    data: feedback,
  });
});

