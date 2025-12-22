import mongoose, { Schema, Document } from 'mongoose';
import { IRubric, IRubricCriterion } from '../types';

export interface IRubricDocument extends Omit<IRubric, '_id'>, Document {}

const rubricCriterionSchema = new Schema<IRubricCriterion>(
  {
    name: {
      type: String,
      required: [true, 'Criterion name is required'],
      trim: true,
      minlength: [2, 'Criterion name must be at least 2 characters long'],
      maxlength: [100, 'Criterion name cannot exceed 100 characters'],
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum score for criterion is required'],
      min: [0, 'Maximum score cannot be negative'],
      max: [100, 'Maximum score cannot exceed 100'],
    },
    description: {
      type: String,
      required: [true, 'Criterion description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  { _id: false }
);

const rubricSchema = new Schema<IRubricDocument>(
  {
    assignmentId: {
      type: String,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required'],
      unique: true, // One rubric per assignment
    },
    criteria: {
      type: [rubricCriterionSchema],
      required: [true, 'Criteria are required'],
      validate: {
        validator: function (criteria: IRubricCriterion[]) {
          return criteria.length > 0 && criteria.length <= 20;
        },
        message: 'Rubric must have between 1 and 20 criteria',
      },
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

// assignmentId index is automatically created by unique: true constraint

// Virtual for total maximum score
rubricSchema.virtual('totalMaxScore').get(function (this: IRubricDocument) {
  return this.criteria.reduce((total: number, criterion: IRubricCriterion) => total + criterion.maxScore, 0);
});

// Ensure virtual fields are serialized
rubricSchema.set('toJSON', { virtuals: true });
rubricSchema.set('toObject', { virtuals: true });

export const Rubric = mongoose.model<IRubricDocument>('Rubric', rubricSchema);
