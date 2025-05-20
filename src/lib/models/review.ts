import mongoose, { Schema, Document } from 'mongoose';
import { IEmployee } from './employee';

export interface IReview extends Document {
  content: string;
  timestamp: Date;
  targetEmployee: mongoose.Types.ObjectId | IEmployee;
  reviewedBy?: mongoose.Types.ObjectId | IEmployee;
  rating?: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    content: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    targetEmployee: { 
      type: Schema.Types.ObjectId, 
      ref: 'Employee',
      required: true
    },
    reviewedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'Employee'
    },
    rating: { 
      type: Number,
      min: 1,
      max: 5
    },
    category: { 
      type: String,
      enum: ['Performance', 'Behavior', 'Skills', 'General'],
      default: 'General'
    }
  },
  { 
    timestamps: true 
  }
);

// Check if the model already exists to prevent OverwriteModelError during hot reloads
export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema); 