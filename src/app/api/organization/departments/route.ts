import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Organization from '@/lib/models/organization';

// POST to add a department
export async function POST(req: NextRequest) {
  try {
    const { departmentName } = await req.json();
    
    if (!departmentName || departmentName.trim() === '') {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Get the organization
    let organization = await Organization.findOne({});
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if department already exists
    if (organization.departments.includes(departmentName)) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 400 }
      );
    }
    
    // Add department
    organization.departments.push(departmentName);
    await organization.save();
    
    return NextResponse.json(organization, { status: 200 });
  } catch (error) {
    console.error('Failed to add department:', error);
    return NextResponse.json(
      { error: 'Failed to add department' },
      { status: 500 }
    );
  }
} 