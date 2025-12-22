import mongoose, { Schema, Document } from 'mongoose';
import { IAssignment, SubmissionType } from '../types';

export interface IAssignmentDocument extends Omit<IAssignment, '_id'>, Document {}

const assignmentSchema = new Schema({
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    teacherId: {
      type: String,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    allowedSubmissionType: {
      type: String,
      enum: {
        values: ['TEXT', 'FILE'] as SubmissionType[],
        message: 'Submission type must be either TEXT or FILE',
      },
      required: [true, 'Submission type is required'],
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum score is required'],
      min: [0, 'Maximum score cannot be negative'],
      max: [1000, 'Maximum score cannot exceed 1000'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_: any, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient queries
assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isPublished: 1 });
assignmentSchema.index({ teacherId: 1, isPublished: 1 });

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function (this: any) {
  return new Date() > this.dueDate;
});

// Ensure virtual fields are serialized
assignmentSchema.set('toJSON', { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
