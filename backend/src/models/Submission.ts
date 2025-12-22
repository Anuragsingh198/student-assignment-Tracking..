import mongoose, { Schema, Document } from 'mongoose';
import { ISubmission, SubmissionStatus } from '../types';

export interface ISubmissionDocument extends Omit<ISubmission, '_id'>, Document {}

const submissionSchema = new Schema<ISubmissionDocument>(
  {
    assignmentId: {
      type: String,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required'],
    },
    studentId: {
      type: String,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    content: {
      type: String,
      trim: true,
      validate: {
        validator: async function (this: ISubmissionDocument, value: string) {
          // If this is a TEXT submission, content is required
          if (this.assignmentId) {
            const Assignment = mongoose.model('Assignment');
            const assignment = await Assignment.findById(this.assignmentId);
            if (assignment && assignment.allowedSubmissionType === 'TEXT' && (!value || value.trim().length === 0)) {
              return false;
            }
          }
          return true;
        },
        message: 'Content is required for TEXT submissions',
      },
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      min: [0, 'File size cannot be negative'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1'],
    },
    status: {
      type: String,
      enum: {
        values: ['SUBMITTED', 'EVALUATED'] as SubmissionStatus[],
        message: 'Status must be either SUBMITTED or EVALUATED',
      },
      default: 'SUBMITTED',
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      validate: {
        validator: function (value: number) {
          // This will be validated against assignment maxScore during evaluation
          return value >= 0;
        },
        message: 'Score must be a non-negative number',
      },
    },
  },
  {
    timestamps: false, // We use submittedAt instead of createdAt
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for efficient queries
submissionSchema.index({ assignmentId: 1, studentId: 1 }); // For finding student's submission for assignment
submissionSchema.index({ studentId: 1, submittedAt: -1 }); // For student's submission history
submissionSchema.index({ assignmentId: 1, status: 1 }); // For finding submissions by status
submissionSchema.index({ assignmentId: 1, studentId: 1, version: -1 }); // For latest version lookup

// Compound unique index to prevent duplicate submissions (same assignment, student, version)
submissionSchema.index(
  { assignmentId: 1, studentId: 1, version: 1 },
  {
    unique: true,
    partialFilterExpression: { version: { $exists: true } },
  }
);

// Pre-save middleware to determine if submission is late
submissionSchema.pre('save', async function (this: ISubmissionDocument, next) {
  if (this.isNew) {
    try {
      const Assignment = mongoose.model('Assignment');
      const assignment = await Assignment.findById(this.assignmentId);

      if (assignment && this.submittedAt > assignment.dueDate) {
        this.isLate = true;
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Static method to get latest submission for a student-assignment pair
submissionSchema.statics.getLatestSubmission = function (
  assignmentId: string,
  studentId: string
) {
  return this.findOne({ assignmentId, studentId })
    .sort({ version: -1 })
    .exec();
};

// Static method to get all submissions for an assignment
submissionSchema.statics.getSubmissionsByAssignment = function (assignmentId: string) {
  return this.find({ assignmentId })
    .populate('studentId', 'name email')
    .sort({ submittedAt: -1 })
    .exec();
};

export const Submission = mongoose.model<ISubmissionDocument>('Submission', submissionSchema);
