import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET review for a specific employee given by the current authenticated user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    
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
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (empError || !currentEmployee) {
      console.error('Error fetching employee profile:', empError);
      return NextResponse.json(
        { error: 'Employee profile not found' },
        { status: 404 }
      );
    }
    
    // Verify that the current user is authorized to review this employee
    const { data: authorization, error: authorizationError } = await supabase
      .from('employee_review_to')
      .select('*')
      .eq('reviewer_id', currentEmployee.id)
      .eq('reviewee_id', employeeId);
    
    const canReview = authorization && authorization.length > 0;
    
    // Get the target employee details
    const { data: targetEmployee, error: targetError } = await supabase
      .from('employees')
      .select(`
        id,
        name,
        role,
        department:department_id (
          id,
          name
        )
      `)
      .eq('id', employeeId)
      .single();
    
    if (targetError || !targetEmployee) {
      console.error('Error fetching target employee:', targetError);
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Get only the review written by the current user for this employee
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        id,
        content,
        created_at
      `)
      .eq('target_employee_id', employeeId)
      .eq('reviewed_by_id', currentEmployee.id)
      .maybeSingle();
    
    if (reviewError) {
      console.error('Error fetching review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to fetch review' },
        { status: 500 }
      );
    }
    
    // Format the review if it exists
    const formattedReview = review ? {
      id: review.id,
      content: review.content,
      timestamp: review.created_at
    } : null;
    
    // Fix the TypeScript error by properly casting the department property
    const department = targetEmployee.department as any;
    
    return NextResponse.json({
      employee: {
        id: targetEmployee.id,
        name: targetEmployee.name,
        role: targetEmployee.role,
        department: department?.name || null
      },
      review: formattedReview,
      hasReviewed: !!review,
      canReview: canReview
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch employee review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee review' },
      { status: 500 }
    );
  }
} 