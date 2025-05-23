import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  role: string;
  email?: string;
  department?: string;
  hireDate?: Date;
  assignedReviewees?: mongoose.Types.ObjectId[] | string[];
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String,
      unique: true,
      sparse: true
    },
    department: { 
      type: String 
    },
    hireDate: { 
      type: Date 
    },
    assignedReviewees: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Employee' 
    }]
  },
  { 
    timestamps: true 
  }
);

// Check if the model already exists to prevent OverwriteModelError during hot reloads
export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema); 