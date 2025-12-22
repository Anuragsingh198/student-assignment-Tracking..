export type UserRole = 'student' | 'teacher';

export type SubmissionType = 'TEXT' | 'FILE';

export type SubmissionStatus = 'SUBMITTED' | 'EVALUATED';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

export interface IAssignment {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  dueDate: Date;
  allowedSubmissionType: SubmissionType;
  maxScore: number;
  createdAt: Date;
  isPublished: boolean;
}

export interface ISubmission {
  _id: string;
  assignmentId: string;
  studentId: string;
  content: string; // text content or file URL
  fileUrl?: string; // URL/path to uploaded file
  fileName?: string; // original file name
  fileSize?: number; // file size in bytes
  submittedAt: Date;
  isLate: boolean;
  version: number;
  status: SubmissionStatus;
  score?: number;
}

export interface IRubricCriterion {
  name: string;
  maxScore: number;
  description: string;
}

export interface IRubric {
  _id: string;
  assignmentId: string;
  criteria: IRubricCriterion[];
}

export interface IFeedback {
  _id: string;
  submissionId: string;
  teacherId: string;
  comments: string;
  aiSuggestedFeedback?: string;
  grammarScore?: number;
  clarityScore?: number;
  createdAt: Date;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request/Response types for API endpoints
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ICreateAssignmentRequest {
  title: string;
  description: string;
  dueDate: Date;
  allowedSubmissionType: SubmissionType;
  maxScore: number;
}

export interface ICreateSubmissionRequest {
  content: string;
  assignmentId: string;
}

export interface IEvaluationRequest {
  score: number;
  comments: string;
}

export interface IAIFeedbackResponse {
  suggestedFeedback: string;
  grammarScore: number;
  clarityScore: number;
}
