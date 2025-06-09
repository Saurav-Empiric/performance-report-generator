import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Get current user's organization
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (orgError || !orgData) {
      console.error('Error fetching organization:', orgError);
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get current date
    const currentDate = new Date();
    
    // Calculate the past three completed months (excluding current month)
    const months = [];
    for (let i = 1; i <= 3; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
    }

    // Get all employees from the organization
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, name, role, department_id')
      .eq('organization_id', orgData.id);

    if (empError || !employees) {
      console.error('Error fetching employees:', empError);
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      );
    }

    // Get reports for all employees for the past three completed months
    const employeeReports = [];
    
    for (const employee of employees) {
      // Get reports for this employee for the past three months
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('employee_id', employee.id)
        .in('month', months);
      
      if (reportsError) {
        console.error(`Error fetching reports for employee ${employee.id}:`, reportsError);
        continue;
      }

      // Calculate average rating for this employee
      if (reports && reports.length > 0) {
        const totalRating = reports.reduce((sum, report) => sum + report.ranking, 0);
        const avgRating = totalRating / reports.length;
        
        employeeReports.push({
          employee,
          avgRating,
          reportsCount: reports.length,
          missingMonths: months.filter(month => !reports.some(report => report.month === month))
        });
      } else {
        employeeReports.push({
          employee,
          avgRating: 0,
          reportsCount: 0,
          missingMonths: months
        });
      }
    }

    // Sort by average rating (highest first)
    employeeReports.sort((a, b) => b.avgRating - a.avgRating);

    // Get department information for the employees
    const departmentIds = [...new Set(employees.map(emp => emp.department_id).filter(Boolean))];
    
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .in('id', departmentIds);

    if (deptError) {
      console.error('Error fetching departments:', deptError);
    }

    // Enrich employee data with department names
    const enrichedEmployeeReports = employeeReports.map(item => {
      const department = departments?.find(dept => dept.id === item.employee.department_id);
      return {
        ...item,
        employee: {
          ...item.employee,
          department: department?.name || 'Unknown'
        }
      };
    });

    return NextResponse.json({
      bestEmployees: enrichedEmployeeReports,
      months
    }, { status: 200 });
    
  } catch (error) {
    console.error('Failed to get best employee:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get best employee';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 