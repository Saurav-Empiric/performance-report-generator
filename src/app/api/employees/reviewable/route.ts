import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET list of employees that the current user can review
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the employee profile for the current user
    const { data: currentEmployee, error: empError } = await supabase
      .from('employees')
      .select('id, name, role, department_id')
      .eq('email', user.email)
      .single();
    
    if (empError || !currentEmployee) {
      console.error('Error fetching employee profile:', empError);
      return NextResponse.json(
        { error: 'Employee profile not found' },
        { status: 404 }
      );
    }
    
    // Get the list of employees that the current user can review
    const { data: reviewAssignments, error: assignmentError } = await supabase
      .from('employee_review_to')
      .select(`
        reviewee:reviewee_id (
          id,
          name,
          role,
          department:department_id (
            id,
            name
          )
        )
      `)
      .eq('reviewer_id', currentEmployee.id);
    
    if (assignmentError) {
      console.error('Error fetching review assignments:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to fetch review assignments' },
        { status: 500 }
      );
    }
    
    // Format the response
    const reviewableEmployees = reviewAssignments.map(assignment => {
      const reviewee = assignment.reviewee as any;
      return {
        id: reviewee.id,
        name: reviewee.name,
        role: reviewee.role,
        department: reviewee.department?.name || null
      };
    });
    
    return NextResponse.json({
      currentEmployee: {
        id: currentEmployee.id,
        name: currentEmployee.name,
        role: currentEmployee.role
      },
      reviewableEmployees
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch reviewable employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviewable employees' },
      { status: 500 }
    );
  }
} 