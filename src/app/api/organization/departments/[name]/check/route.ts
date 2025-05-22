import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Employee from '@/lib/models/employee';

// Check if a department is used by any employees
export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = await params;
    const departmentName = decodeURIComponent(name);
    
    await connectToDatabase();
    
    // Count employees with this department
    const count = await Employee.countDocuments({ department: departmentName });
    
    return NextResponse.json({ inUse: count > 0 }, { status: 200 });
  } catch (error) {
    console.error('Failed to check department usage:', error);
    return NextResponse.json(
      { error: 'Failed to check department usage' },
      { status: 500 }
    );
  }
}