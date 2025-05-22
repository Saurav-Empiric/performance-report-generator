import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  departments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String,
      required: true
    },
    phone: { 
      type: String
    },
    address: { 
      type: String 
    },
    logoUrl: { 
      type: String
    },
    departments: {
      type: [String],
      default: []
    }
  },
  { 
    timestamps: true 
  }
);

// Check if the model already exists to prevent OverwriteModelError during hot reloads
export default mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema); 