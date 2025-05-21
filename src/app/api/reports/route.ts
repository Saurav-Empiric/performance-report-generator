import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import mongoose from 'mongoose';
import Report from '@/lib/models/report';

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
    
    // Fetch all reports for the employee
    const reports = await Report.find({ employeeId }).sort({ month: -1 });
    
    // Format the response
    const formattedReports = reports.map(report => ({
      _id: report._id.toString(),
      employeeId: report.employeeId.toString(),
      month: report.month,
      ranking: report.ranking,
      improvements: report.improvements,
      qualities: report.qualities,
      summary: report.summary,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }));
    
    return NextResponse.json(formattedReports, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
} 