import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET reviews for a specific employee given by the current authenticated user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employeeId = (await params).id;
    
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
    
    // Get all reviews written by the current user for this employee
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        id,
        content,
        created_at
      `)
      .eq('target_employee_id', employeeId)
      .eq('reviewed_by_id', currentEmployee.id)
      .order('created_at', { ascending: true });
    
    if (reviewError) {
      console.error('Error fetching reviews:', reviewError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }
    
    // Format the reviews
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      content: review.content,
      timestamp: review.created_at
    }));
    
    return NextResponse.json({
      reviews: formattedReviews,
      hasReviewed: formattedReviews.length > 0
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch employee reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee reviews' },
      { status: 500 }
    );
  }
} 