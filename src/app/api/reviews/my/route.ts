import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET reviews written by the current user
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
      .select('id, name, role')
      .eq('email', user.email)
      .single();
    
    if (empError || !currentEmployee) {
      console.error('Error fetching employee profile:', empError);
      return NextResponse.json(
        { error: 'Employee profile not found' },
        { status: 404 }
      );
    }
    
    // Get reviews written by the current user
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        content,
        created_at,
        target_employee:target_employee_id (
          id,
          name,
          role,
          department:department_id (
            id,
            name
          )
        )
      `)
      .eq('reviewed_by_id', currentEmployee.id)
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }
    
    // Format the response
    const formattedReviews = reviews.map(review => {
      const targetEmployee = review.target_employee as any;
      return {
        id: review.id,
        content: review.content,
        timestamp: review.created_at,
        targetEmployee: {
          id: targetEmployee.id,
          name: targetEmployee.name,
          role: targetEmployee.role,
          department: targetEmployee.department?.name || null
        }
      };
    });
    
    return NextResponse.json({
      reviewer: {
        id: currentEmployee.id,
        name: currentEmployee.name,
        role: currentEmployee.role
      },
      reviews: formattedReviews
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch my reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch my reviews' },
      { status: 500 }
    );
  }
} 