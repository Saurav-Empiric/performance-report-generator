import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Define types for Supabase responses
interface Employee {
  id: string;
  name: string;
  role: string;
  department_id: string;
}

interface ReviewEmployee {
  id: string;
  organization_id: string;
}

// GET all reviews with optional query params
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetEmployee = searchParams.get('targetEmployee');
    const reviewedBy = searchParams.get('reviewedBy');
    
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
    
    // Build query
    let query = supabase
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
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (targetEmployee) {
      query = query.eq('target_employee_id', targetEmployee);
    }
    
    if (reviewedBy) {
      query = query.eq('reviewed_by_id', reviewedBy);
    }
    
    const { data: reviews, error } = await query;
    
    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }
    
    // Format the response to match the expected structure
    const formattedReviews = reviews?.map(review => {
      // Handle the type conversion safely
      const targetEmployee = review.target_employee as unknown as Employee;
      const reviewerEmployee = review.reviewer as unknown as Employee | null;
      
      return {
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
    }) || [];
    
    return NextResponse.json(formattedReviews, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST to create a new review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.content || !body.targetEmployee) {
      return NextResponse.json(
        { error: 'Content and targetEmployee are required fields' },
        { status: 400 }
      );
    }
    
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
    
    // Get the employee data for the reviewer (the authenticated user)
    const { data: currentEmployee, error: reviewerError } = await supabase
      .from('employees')
      .select('id, organization_id')
      .eq('email', user.email)
      .single();
    
    if (reviewerError || !currentEmployee) {
      console.error('Error fetching reviewer:', reviewerError);
      return NextResponse.json(
        { error: 'Reviewer profile not found' },
        { status: 404 }
      );
    }
    
    // Verify that target employee exists and is in the same organization
    const { data: targetEmployee, error: targetError } = await supabase
      .from('employees')
      .select('id, organization_id')
      .eq('id', body.targetEmployee)
      .single();
    
    if (targetError || !targetEmployee) {
      console.error('Error fetching target employee:', targetError);
      return NextResponse.json(
        { error: 'Target employee not found' },
        { status: 404 }
      );
    }
    
    // Check that both employees are in the same organization
    if (targetEmployee.organization_id !== currentEmployee.organization_id) {
      return NextResponse.json(
        { error: 'Cannot review employees from different organizations' },
        { status: 403 }
      );
    }
    
    // Check that the reviewer is authorized to review this employee
    const { data: assignmentCheck, error: assignmentError } = await supabase
      .from('employee_review_to')
      .select('*')
      .eq('reviewer_id', currentEmployee.id)
      .eq('reviewee_id', targetEmployee.id);
    
    if (assignmentError) {
      console.error('Error checking reviewer assignment:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to verify reviewer authorization' },
        { status: 500 }
      );
    }
    
    if (!assignmentCheck || assignmentCheck.length === 0) {
      return NextResponse.json(
        { error: 'You are not authorized to review this employee' },
        { status: 403 }
      );
    }
    
    // Prepare the review data
    const reviewData = {
      content: body.content,
      target_employee_id: body.targetEmployee,
      reviewed_by_id: currentEmployee.id,
      organization_id: currentEmployee.organization_id
    };
    
    // Insert the review
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert(reviewData)
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
    
    if (insertError) {
      console.error('Error creating review:', insertError);
      
      // Check if it's a permission error (likely due to RLS)
      if (insertError.code === '42501') {
        return NextResponse.json(
          { error: 'You are not authorized to review this employee' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }
    
    if (!newReview) {
      return NextResponse.json(
        { error: 'Failed to create review - no data returned' },
        { status: 500 }
      );
    }
    
    // Handle the type conversion safely
    const targetEmployeeData = newReview.target_employee as unknown as Employee;
    const reviewerEmployee = newReview.reviewer as unknown as Employee | null;
    
    // Format the response to match the expected structure
    const formattedReview = {
      id: newReview.id,
      content: newReview.content,
      timestamp: newReview.created_at,
      targetEmployee: targetEmployeeData ? {
        id: targetEmployeeData.id,
        name: targetEmployeeData.name,
        role: targetEmployeeData.role,
      } : null,
      reviewedBy: reviewerEmployee ? {
        id: reviewerEmployee.id,
        name: reviewerEmployee.name,
        role: reviewerEmployee.role,
      } : null,
      createdAt: newReview.created_at
    };
    
    return NextResponse.json(formattedReview, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 