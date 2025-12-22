import { Request, Response } from 'express';
import { Submission, Assignment } from '../models';
import { IApiResponse, IPaginatedResponse } from '../types';
import { ISubmissionDocument } from '../models';
import { asyncHandler, AppError } from '../middleware/error.middleware';

export const createSubmission = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { assignmentId } = req.params;
  const { content } = req.body;
  const cloudinaryFile = (req as any).cloudinaryFile;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (!assignment.isPublished) {
    throw new AppError('Assignment is not available for submission', 400);
  }

  const latestSubmission = await Submission.findOne({ assignmentId, studentId: req.user.userId })
    .sort({ version: -1 })
    .exec();

  const version = latestSubmission ? latestSubmission.version + 1 : 1;

  const now = new Date();
  const isLate = now > assignment.dueDate;

  let submissionData: any = {
    assignmentId,
    studentId: req.user.userId,
    submittedAt: now,
    isLate,
    version,
    status: 'SUBMITTED',
  };

  if (assignment.allowedSubmissionType === 'TEXT') {
    if (!content || content.trim().length === 0) {
      throw new AppError('Content is required for TEXT submissions', 400);
    }
    submissionData.content = content.trim();
  } else if (assignment.allowedSubmissionType === 'FILE') {
    if (!cloudinaryFile) {
      throw new AppError('File is required for FILE submissions', 400);
    }

    submissionData.fileUrl = cloudinaryFile.url;
    submissionData.fileName = cloudinaryFile.fileName;
    submissionData.fileSize = cloudinaryFile.fileSize;
    submissionData.content = content && content.trim() ? content.trim() : '';
  }

  const submission = new Submission(submissionData);

  await submission.save();

  await submission.populate([
    { path: 'assignmentId', select: 'title dueDate maxScore allowedSubmissionType' },
    { path: 'studentId', select: 'name email' },
  ]);

  res.status(201).json({
    success: true,
    message: 'Submission created successfully',
    data: submission,
  });
});

export const getMySubmissions = asyncHandler(async (
  req: Request,
  res: Response<IPaginatedResponse<ISubmissionDocument>>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const submissions = await Submission.find({ studentId: req.user.userId })
    .populate('assignmentId', 'title dueDate maxScore allowedSubmissionType isPublished')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Submission.countDocuments({ studentId: req.user.userId });
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: submissions,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

export const getSubmission = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { id } = req.params;

  const submission = await Submission.findById(id)
    .populate('assignmentId', 'title description dueDate maxScore teacherId')
    .populate('studentId', 'name email');

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

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
    data: submission,
  });
});

export const getAssignmentSubmissions = asyncHandler(async (
  req: Request,
  res: Response<IPaginatedResponse<ISubmissionDocument>>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { assignmentId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (req.user.role !== 'teacher' || assignment.teacherId.toString() !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  const submissions = await Submission.aggregate([
    { $match: { assignmentId: assignment._id } },
    { $sort: { studentId: 1, version: -1 } },
    {
      $group: {
        _id: '$studentId',
        latestSubmission: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: { newRoot: '$latestSubmission' },
    },
    { $sort: { submittedAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const populatedSubmissions = await Submission.populate(submissions, [
    { path: 'studentId', select: 'name email' },
    { path: 'assignmentId', select: 'title' },
  ]);

  const totalResult = await Submission.aggregate([
    { $match: { assignmentId: assignment._id } },
    {
      $group: {
        _id: '$studentId',
        latestSubmission: { $first: '$$ROOT' },
      },
    },
    { $count: 'total' },
  ]);

  const total = totalResult[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: populatedSubmissions,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

export const getSubmissionVersions = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { assignmentId } = req.params;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (req.user.role === 'student') {
    const submissions = await Submission.find({
      assignmentId,
      studentId: req.user.userId,
    })
      .sort({ version: -1 })
      .exec();

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } else if (req.user.role === 'teacher') {
    if (assignment.teacherId.toString() !== req.user.userId) {
      throw new AppError('Access denied', 403);
    }

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email')
      .sort({ studentId: 1, version: -1 })
      .exec();

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } else {
    throw new AppError('Access denied', 403);
  }
});

export const getAllSubmissions = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  if (req.user.role !== 'teacher') {
    throw new AppError('Access denied', 403);
  }

  const submissions = await Submission.find({})
    .populate('studentId', 'name email')
    .populate('assignmentId', 'title dueDate')
    .sort({ submittedAt: -1 })
    .exec();

  res.status(200).json({
    success: true,
    data: submissions,
  });
});

export const getTeacherAssignmentsWithSubmissions = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  if (req.user.role !== 'teacher') {
    throw new AppError('Access denied', 403);
  }

  const assignments = await Assignment.find({ teacherId: req.user.userId })
    .sort({ createdAt: -1 })
    .exec();

  const assignmentIds = assignments.map(a => a._id);
  const allSubmissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
    .populate('studentId', 'name email')
    .sort({ submittedAt: -1 })
    .exec();

  const assignmentsWithSubmissions = assignments.map(assignment => {
    const submissions = allSubmissions.filter(
      (sub: any) => sub.assignmentId.toString() === assignment._id.toString()
    );

    return {
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      allowedSubmissionType: assignment.allowedSubmissionType,
      maxScore: assignment.maxScore,
      isPublished: assignment.isPublished,
      createdAt: assignment.createdAt,
      submissions: submissions.map((sub: any) => ({
        _id: sub._id,
        studentId: sub.studentId,
        content: sub.content,
        fileUrl: sub.fileUrl,
        fileName: sub.fileName,
        fileSize: sub.fileSize,
        submittedAt: sub.submittedAt,
        isLate: sub.isLate,
        version: sub.version,
        status: sub.status,
        score: sub.score,
      })),
    };
  });

  res.status(200).json({
    success: true,
    data: assignmentsWithSubmissions,
  });
});

export const getStudentAssignmentsWithSubmissions = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  if (req.user.role !== 'student') {
    throw new AppError('Access denied', 403);
  }

  const studentSubmissions = await Submission.find({ studentId: req.user.userId })
    .populate('assignmentId', 'title description dueDate allowedSubmissionType maxScore isPublished')
    .sort({ submittedAt: -1 })
    .exec();

  const assignmentIds = [...new Set(
    studentSubmissions.map((sub: any) =>     sub.assignmentId?._id?.toString() || sub.assignmentId?.toString())
  )].filter(Boolean);

  const assignments = await Assignment.find({
    _id: { $in: assignmentIds },
    isPublished: true,
  }).exec();

  const assignmentsWithSubmissions = assignments.map(assignment => {
    const submissions = studentSubmissions
      .filter((sub: any) => {
        const subAssignmentId = typeof sub.assignmentId === 'object' 
          ? sub.assignmentId?._id?.toString() 
          : sub.assignmentId?.toString();
        return subAssignmentId === assignment._id.toString();
      })
      .map((sub: any) => ({
        _id: sub._id,
        studentId: sub.studentId,
        content: sub.content,
        fileUrl: sub.fileUrl,
        fileName: sub.fileName,
        fileSize: sub.fileSize,
        submittedAt: sub.submittedAt,
        isLate: sub.isLate,
        version: sub.version,
        status: sub.status,
        score: sub.score,
      }));

    return {
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      allowedSubmissionType: assignment.allowedSubmissionType,
      maxScore: assignment.maxScore,
      isPublished: assignment.isPublished,
      createdAt: assignment.createdAt,
      submissions,
    };
  });

  res.status(200).json({
    success: true,
    data: assignmentsWithSubmissions,
  });
});