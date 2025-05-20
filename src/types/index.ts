export interface Employee {
  _id: string;
  name: string;
  role: string;
  department?: string;
  email?: string;
  hireDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Review {
  _id: string;
  content: string;
  timestamp: Date;
  targetEmployee: Employee | string;
  reviewedBy?: Employee | string;
  rating?: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 