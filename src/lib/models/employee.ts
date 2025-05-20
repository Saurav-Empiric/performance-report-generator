import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  role: string;
  email?: string;
  department?: string;
  hireDate?: Date;
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
    }
  },
  { 
    timestamps: true 
  }
);

// Check if the model already exists to prevent OverwriteModelError during hot reloads
export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema); 