import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Define types for Supabase responses
interface Employee {
  id: string;
  name: string;
  role: string;
  department_id: string;
}

// GET a specific review
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
    
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        id,
        content,
        created_at,
        target_employee:target_employee_id (
          id,
          name,
          role,
          department_id
        ),
        reviewer:reviewed_by_id (
          id,
          name,
          role,
          department_id
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching review:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch review' },
        { status: 500 }
      );
    }
    
    // Handle the type conversion safely
    const targetEmployee = review.target_employee as unknown as Employee;
    const reviewerEmployee = review.reviewer as unknown as Employee | null;
    
    // Format the response to match the expected structure
    const formattedReview = {
      id: review.id,
      content: review.content,
      timestamp: review.created_at,
      targetEmployee: targetEmployee ? {
        id: targetEmployee.id,
        name: targetEmployee.name,
        role: targetEmployee.role,
      } : null,
      reviewedBy: reviewerEmployee ? {
        id: reviewerEmployee.id,
        name: reviewerEmployee.name,
        role: reviewerEmployee.role,
      } : null,
      createdAt: review.created_at
    };
    
    return NextResponse.json(formattedReview, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT to update a review
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    
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
    
    // Get the employee profile to check if they're the author of the review
    const { data: currentEmployee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (employeeError || !currentEmployee) {
      console.error('Error fetching employee:', employeeError);
      return NextResponse.json(
        { error: 'Employee profile not found' },
        { status: 404 }
      );
    }
    
    // First check if the review exists and belongs to the current employee
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('id, reviewed_by_id, target_employee_id')
      .eq('id', id)
      .single();
    
    if (reviewError) {
      console.error('Error fetching review:', reviewError);
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Verify that the current employee is the author of the review
    if (existingReview.reviewed_by_id !== currentEmployee.id) {
      return NextResponse.json(
        { error: 'You are not authorized to update this review' },
        { status: 403 }
      );
    }
    
    // Check that the reviewer is still authorized to review this employee
    const { data: assignmentCheck, error: assignmentError } = await supabase
      .from('employee_review_to')
      .select('*')
      .eq('reviewer_id', currentEmployee.id)
      .eq('reviewee_id', existingReview.target_employee_id);
    
    if (assignmentError) {
      console.error('Error checking reviewer assignment:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to verify reviewer authorization' },
        { status: 500 }
      );
    }
    
    if (!assignmentCheck || assignmentCheck.length === 0) {
      return NextResponse.json(
        { error: 'You are no longer authorized to review this employee' },
        { status: 403 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    if (body.content) updateData.content = body.content;
    
    // Update the review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .eq('reviewed_by_id', currentEmployee.id) // Ensure the employee can only update their own reviews
      .select(`
        id,
        content,
        created_at,
        target_employee:target_employee_id (
          id,
          name,
          role,
          department_id
        ),
        reviewer:reviewed_by_id (
          id,
          name,
          role,
          department_id
        )
      `)
      .single();
    
    if (updateError) {
      console.error('Error updating review:', updateError);
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found or you do not have permission to update it' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }
    
    if (!updatedReview) {
      return NextResponse.json(
        { error: 'No review was updated' },
        { status: 404 }
      );
    }
    
    // Handle the type conversion safely
    const targetEmployee = updatedReview.target_employee as unknown as Employee;
    const reviewerEmployee = updatedReview.reviewer as unknown as Employee | null;
    
    // Format the response to match the expected structure
    const formattedReview = {
      id: updatedReview.id,
      content: updatedReview.content,
      timestamp: updatedReview.created_at,
      targetEmployee: targetEmployee ? {
        id: targetEmployee.id,
        name: targetEmployee.name,
        role: targetEmployee.role,
      } : null,
      reviewedBy: reviewerEmployee ? {
        id: reviewerEmployee.id,
        name: reviewerEmployee.name,
        role: reviewerEmployee.role,
      } : null,
      createdAt: updatedReview.created_at
    };
    
    return NextResponse.json(formattedReview, { status: 200 });
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
    
    // Get the employee profile to check if they're the author of the review
    const { data: currentEmployee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (employeeError || !currentEmployee) {
      console.error('Error fetching employee:', employeeError);
      return NextResponse.json(
        { error: 'Employee profile not found' },
        { status: 404 }
      );
    }
    
    // Delete the review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('reviewed_by_id', currentEmployee.id); // Ensure the employee can only delete their own reviews
    
    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Review deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
} 