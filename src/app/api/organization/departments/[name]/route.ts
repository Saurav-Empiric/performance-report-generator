import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Organization from '@/lib/models/organization';

// DELETE a department
export async function DELETE(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const departmentName = decodeURIComponent(params.name);
    
    await connectToDatabase();
    
    // Get the organization
    let organization = await Organization.findOne({});
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if department exists
    if (!organization.departments.includes(departmentName)) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Remove department
    organization.departments = organization.departments.filter(
      (dept: string) => dept !== departmentName
    );
    
    await organization.save();
    
    return NextResponse.json(organization, { status: 200 });
  } catch (error) {
    console.error('Failed to delete department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
} 