import mongoose, { Schema, Document } from 'mongoose';
import { IFeedback } from '../types';

export interface IFeedbackDocument extends Omit<IFeedback, '_id'>, Document {}

const feedbackSchema = new Schema<IFeedbackDocument>(
  {
    submissionId: {
      type: String,
      ref: 'Submission',
      required: [true, 'Submission ID is required'],
      unique: true, // One feedback per submission
    },
    teacherId: {
      type: String,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },
    comments: {
      type: String,
      required: [true, 'Comments are required'],
      trim: true,
      minlength: [10, 'Comments must be at least 10 characters long'],
      maxlength: [2000, 'Comments cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// submissionId index is automatically created by unique: true constraint
// Indexes for efficient queries
feedbackSchema.index({ teacherId: 1 });
feedbackSchema.index({ createdAt: -1 });

export const Feedback = mongoose.model<IFeedbackDocument>('Feedback', feedbackSchema);
