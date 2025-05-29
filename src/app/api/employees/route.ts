import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET all employees
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
    
    // Get all employees for this organization with their departments
    const { data: employees, error: empError } = await supabase
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
      .eq('organization_id', orgData.id)
      .order('name');
    
    if (empError) {
      console.error('Error fetching employees:', empError);
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      );
    }
    
    // Get review relationships for all employees
    const { data: reviewRelationships, error: relError } = await supabase
      .from('employee_review_to')
      .select(`
        reviewer_id,
        reviewee_id
      `);
    
    if (relError) {
      console.error('Error fetching review relationships:', relError);
      // Continue without review relationships
    }
    
    // Format the response to match the expected structure
    const formattedEmployees = employees?.map(employee => {
      // Find reviewees for this employee
      const revieweeIds = reviewRelationships
        ?.filter(rel => rel.reviewer_id === employee.id)
        .map(rel => rel.reviewee_id) || [];
      
      // Find the reviewees' details from the employees list
      const assignedReviewees = employees
        ?.filter(emp => revieweeIds.includes(emp.id))
        .map(reviewee => {
          // Use type assertions to avoid TypeScript errors
          const dept = (reviewee.departments as any)?.name ?? null;
          return {
            _id: reviewee.id,
            name: reviewee.name,
            role: reviewee.role,
            department: dept
          };
        }) || [];
      
      // Use type assertion for departments
      const dept = (employee.departments as any)?.name ?? null;
      
      return {
        _id: employee.id,
        name: employee.name,
        role: employee.role,
        email: employee.email,
        department: dept,
        assignedReviewees
      };
    });
    
    return NextResponse.json(formattedEmployees, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST to create a new employee
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.role || !body.email || !body.department) {
      return NextResponse.json(
        { error: 'Name, role, email, and department are required fields' },
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
    
    // Get department ID from name
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('name', body.department)
      .eq('organization_id', orgData.id)
      .single();
    
    if (deptError) {
      console.error('Error fetching department:', deptError);
      return NextResponse.json(
        { error: 'Department not found. Please create it first.' },
        { status: 404 }
      );
    }
    
    // Create the employee
    const { data: newEmployee, error: createError } = await supabase
      .from('employees')
      .insert({
        name: body.name,
        role: body.role,
        email: body.email,
        department_id: deptData.id,
        organization_id: orgData.id
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating employee:', createError);
      return NextResponse.json(
        { error: 'Failed to create employee' },
        { status: 500 }
      );
    }
    
    // If assignedReviewees is provided, create review relationships
    if (body.assignedReviewees && Array.isArray(body.assignedReviewees) && body.assignedReviewees.length > 0) {
      const reviewRelationships = body.assignedReviewees.map((revieweeId: string) => ({
        reviewer_id: newEmployee.id,
        reviewee_id: revieweeId
      }));
      
      const { error: reviewError } = await supabase
        .from('employee_review_to')
        .insert(reviewRelationships);
      
      if (reviewError) {
        console.error('Error assigning reviewees:', reviewError);
        // Continue anyway, as employee creation was successful
      }
    }
    
    // Format the response to match the expected structure
    const response = {
      _id: newEmployee.id,
      name: newEmployee.name,
      role: newEmployee.role,
      email: newEmployee.email,
      department: body.department,
      assignedReviewees: [] // Initially empty, will be populated when fetched
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Failed to create employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
} 