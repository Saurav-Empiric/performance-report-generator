import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Organization from '@/lib/models/organization';

// GET organization settings
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get the organization settings (only one organization should exist)
    let organization = await Organization.findOne({});
    
    // If no organization exists, create a default one
    if (!organization) {
      organization = await Organization.create({
        name: "My Organization",
        email: "contact@organization.com",
        phone: "",
        address: "",
        logoUrl: "",
        departments: []
      });
    }
    
    return NextResponse.json(organization, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization settings' },
      { status: 500 }
    );
  }
}

// PUT to update organization settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required fields' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find and update organization (only one should exist)
    const organization = await Organization.findOne({});
    
    if (!organization) {
      // If no organization exists, create a new one
      const newOrganization = await Organization.create(body);
      return NextResponse.json(newOrganization, { status: 201 });
    }
    
    // Update fields (excluding departments which are handled by a separate endpoint)
    const { departments, ...updateData } = body;
    
    // Update organization
    const updatedOrganization = await Organization.findByIdAndUpdate(
      organization._id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json(updatedOrganization, { status: 200 });
  } catch (error) {
    console.error('Failed to update organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
} 