import { NextRequest, NextResponse } from 'next/server';
import { getAllEmployeeReports } from '@/services/report.services';
import connectToDatabase from '@/lib/db';
import mongoose from 'mongoose';

// Helper to check if the ID is valid
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET reports for an employee
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(employeeId)) {
      return NextResponse.json(
        { error: 'Invalid employee ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const reports = await getAllEmployeeReports(employeeId);
    
    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
} 