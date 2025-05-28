import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET all departments
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the organization
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('id')
      .single();
    
    if (orgError) {
      console.error('Error fetching organization:', orgError);
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Get all departments for this organization
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', orgData.id)
      .order('name', { ascending: true });
      
    if (deptError) {
      console.error('Error fetching departments:', deptError);
      return NextResponse.json(
        { error: 'Failed to fetch departments' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

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
    
    const supabase = await createClient();
    
    // Get the organization
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('id')
      .single();
    
    if (orgError) {
      console.error('Error fetching organization:', orgError);
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if department already exists
    const { data: existingDept, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('organization_id', orgData.id)
      .eq('name', departmentName)
      .maybeSingle();
      
    if (deptError) {
      console.error('Error checking existing department:', deptError);
      return NextResponse.json(
        { error: 'Error checking for existing department' },
        { status: 500 }
      );
    }
    
    if (existingDept) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 400 }
      );
    }
    
    // Add department
    const { data: newDept, error: insertError } = await supabase
      .from('departments')
      .insert({
        name: departmentName,
        organization_id: orgData.id
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Error adding department:', insertError);
      return NextResponse.json(
        { error: 'Failed to add department' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newDept, { status: 201 });
  } catch (error) {
    console.error('Failed to add department:', error);
    return NextResponse.json(
      { error: 'Failed to add department' },
      { status: 500 }
    );
  }
} 