import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE a department
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const {name} = await params;
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
    
    // Check if department exists
    const { data: existingDept, error: checkError } = await supabase
      .from('departments')
      .select('id')
      .eq('organization_id', orgData.id)
      .eq('name', departmentName)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking department:', checkError);
      return NextResponse.json(
        { error: 'Error checking department' },
        { status: 500 }
      );
    }
    
    if (!existingDept) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Delete the department
    const { error: deleteError } = await supabase
      .from('departments')
      .delete()
      .eq('id', existingDept.id);
    
    if (deleteError) {
      console.error('Error deleting department:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete department' },
        { status: 500 }
      );
    }
    
    // Get updated list of departments
    const { data: updatedDepts, error: listError } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', orgData.id)
      .order('name', { ascending: true });
      
    return NextResponse.json(
      { message: 'Department deleted successfully', departments: updatedDepts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
} 