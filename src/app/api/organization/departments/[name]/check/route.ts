import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Check if a department is used by any employees
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const departmentName = decodeURIComponent(name);
    
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
    
    // First get the department id
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('organization_id', orgData.id)
      .eq('name', departmentName)
      .maybeSingle();
      
    if (deptError) {
      console.error('Error fetching department:', deptError);
      return NextResponse.json(
        { error: 'Error checking department' },
        { status: 500 }
      );
    }
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Count employees with this department
    const { count, error: countError } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('department_id', department.id);
      
    if (countError) {
      console.error('Error counting employees:', countError);
      return NextResponse.json(
        { error: 'Failed to check department usage' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ inUse: count !== null && count > 0 }, { status: 200 });
  } catch (error) {
    console.error('Failed to check department usage:', error);
    return NextResponse.json(
      { error: 'Failed to check department usage' },
      { status: 500 }
    );
  }
}