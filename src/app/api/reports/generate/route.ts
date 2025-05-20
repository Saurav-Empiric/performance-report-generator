import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeMonthlyReport } from '@/services/report.services';
import mongoose from 'mongoose';

// Helper to check if the ID is valid
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Helper to validate month format (YYYY-MM)
function isValidMonth(month: string) {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(month)) return false;
  
  const [year, monthNum] = month.split('-').map(Number);
  if (monthNum < 1 || monthNum > 12) return false;
  
  return true;
}

// POST to generate a report
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, month } = body;
    
    // Validate required fields
    if (!employeeId || !month) {
      return NextResponse.json(
        { error: 'Employee ID and month are required fields' },
        { status: 400 }
      );
    }
    
    // Validate ID format
    if (!isValidObjectId(employeeId)) {
      return NextResponse.json(
        { error: 'Invalid employee ID format' },
        { status: 400 }
      );
    }
    
    // Validate month format
    if (!isValidMonth(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 }
      );
    }
    
    // Get or generate the report
    const report = await getEmployeeMonthlyReport(employeeId, month);
    
    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('Failed to generate report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 