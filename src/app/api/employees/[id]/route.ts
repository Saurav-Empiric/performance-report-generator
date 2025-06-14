import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET a specific employee
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get the employee with department details
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        id,
        name,
        role,
        email,
        department_id,
        departments:department_id(
          id,
          name
        )
      `)
      .eq('id', id)
      .single();
    
    if (empError) {
      console.error('Error fetching employee:', empError);
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Get reviewees for this employee
    const { data: reviewRelationships, error: relError } = await supabase
      .from('employee_review_to')
      .select(`
        reviewee_id
      `)
      .eq('reviewer_id', id);
    
    if (relError) {
      console.error('Error fetching review relationships:', relError);
      // Continue without reviewees
    }
    
    // Get the details of all reviewees
    const revieweeIds = reviewRelationships?.map(rel => rel.reviewee_id) || [];
    let assignedReviewees: any[] = [];
    
    if (revieweeIds.length > 0) {
      const { data: reviewees, error: revieweesError } = await supabase
        .from('employees')
        .select(`
          id,
          name,
          role,
          department_id,
          departments:department_id(
            id,
            name
          )
        `)
        .in('id', revieweeIds);
      
      if (!revieweesError && reviewees) {
        assignedReviewees = reviewees.map(reviewee => ({
          _id: reviewee.id,
          name: reviewee.name,
          role: reviewee.role,
          department: (reviewee.departments as any)?.name ?? null
        }));
      }
    }
    
    // Format the response
    const formattedEmployee = {
      _id: employee.id,
      name: employee.name,
      role: employee.role,
      email: employee.email,
      department: (employee.departments as any)?.name ?? null,
      assignedReviewees
    };
    
    return NextResponse.json(formattedEmployee, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// DELETE an employee
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Check if employee exists
    const { error: checkError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (checkError) {
      console.error('Error checking employee:', checkError);
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Delete all review relationships for this employee
    // This is technically not needed due to CASCADE constraints in your schema,
    // but it's cleaner to delete related records first
    const { error: reviewError } = await supabase
      .from('employee_review_to')
      .delete()
      .or(`reviewer_id.eq.${id},reviewee_id.eq.${id}`);
    
    if (reviewError) {
      console.error('Error deleting review relationships:', reviewError);
      // Continue anyway, as the employee deletion might still succeed
    }
    
    // Delete the employee
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting employee:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete employee' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Employee deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
} 