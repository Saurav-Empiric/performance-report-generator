import mongoose, { Schema, Document } from 'mongoose';
import { IEmployee } from './employee';

export interface IReport extends Document {
  employeeId: mongoose.Types.ObjectId | IEmployee;
  month: string; // Format: YYYY-MM
  ranking: number;
  improvements: string[];
  qualities: string[];
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    employeeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Employee',
      required: true
    },
    month: { 
      type: String, 
      required: true 
    },
    ranking: { 
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    improvements: [{
      type: String
    }],
    qualities: [{
      type: String
    }],
    summary: {
      type: String,
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

// Create a compound index to ensure uniqueness of employee+month
ReportSchema.index({ employeeId: 1, month: 1 }, { unique: true });

// Check if the model already exists to prevent OverwriteModelError during hot reloads
export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema); 