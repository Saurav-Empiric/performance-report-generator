import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Define interfaces for our data structures
interface Employee {
  id: string;
  name: string;
  role: string;
  department_id: string;
}

interface Department {
  id: string;
  name: string;
}

interface Report {
  id: string;
  employee_id: string;
  month: string;
  ranking: number;
  summary: string;
  improvements: string[];
  qualities: string[];
  created_at: string;
}

interface EmployeeWithDepartment {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface MissingReportsEmployee {
  employee: EmployeeWithDepartment;
  missingMonths: string[];
}

interface BestEmployeeData {
  employee: EmployeeWithDepartment;
  avgRating: number;
  reports: {
    month: string;
    ranking: number;
    summary: string;
  }[];
}

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

    if (employees.length === 0) {
      return NextResponse.json(
        { message: 'No employees found in this organization' },
        { status: 404 }
      );
    }

    // Calculate the past three completed months (excluding current month)
    const months: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
    }

    // Get all reports for all employees for the past three completed months
    const { data: allReports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .in('employee_id', employees.map(e => e.id))
      .in('month', months);

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }
    // Organize reports by employee
    const employeeReportsMap = new Map<string, Report[]>();
    const employeeMissingMonths = new Map<string, string[]>();

    // Initialize with empty data for all employees
    employees.forEach(employee => {
      employeeReportsMap.set(employee.id, []);
      employeeMissingMonths.set(employee.id, [...months]); // Start with all months missing
    });

    // Fill in available reports
    if (allReports) {
      allReports.forEach((report: Report) => {
        // Add report to employee's reports list
        const reports = employeeReportsMap.get(report.employee_id) || [];
        reports.push(report);
        employeeReportsMap.set(report.employee_id, reports);

        // Remove month from missing list
        const missingMonths = employeeMissingMonths.get(report.employee_id);
        if (missingMonths) {
          const monthIndex = missingMonths.indexOf(report.month);
          if (monthIndex !== -1) {
            missingMonths.splice(monthIndex, 1);
          }
        }
      });
    }

    // Get department information for the employees
    const departmentIds = [...new Set(employees.map(emp => emp.department_id).filter(Boolean))];

    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .in('id', departmentIds);

    if (deptError) {
      console.error('Error fetching departments:', deptError);
    }

    // Find if any employees have missing reports
    const employeesWithMissingReports: MissingReportsEmployee[] = [];

    employees.forEach(employee => {
      const missingMonths = employeeMissingMonths.get(employee.id);
      if (missingMonths && missingMonths.length > 0) {
        const department = departments?.find(dept => dept.id === employee.department_id);
        employeesWithMissingReports.push({
          employee: {
            id: employee.id,
            name: employee.name,
            role: employee.role,
            department: department?.name ?? 'Unknown',
          },
          missingMonths
        });
      }
    });

    // If any employees have missing reports, return this information instead of the best employee
    if (employeesWithMissingReports.length > 0) {
      return NextResponse.json({
        hasMissingReports: true,
        employeesWithMissingReports,
        months
      }, { status: 200 });
    }

    // Calculate average ratings and find the best employee
    let bestEmployee: BestEmployeeData | null = null;
    let bestAvgRating = -1;

    employees.forEach(employee => {
      const reports = employeeReportsMap.get(employee.id) || [];
      if (reports.length === months.length) { // Only consider employees with all required reports
        const totalRating = reports.reduce((sum: number, report: Report) => sum + report.ranking, 0);
        const avgRating = totalRating / reports.length;

        if (avgRating > bestAvgRating) {
          bestAvgRating = avgRating;
          const department = departments?.find(dept => dept.id === employee.department_id);
          bestEmployee = {
            employee: {
              id: employee.id,
              name: employee.name,
              role: employee.role,
              department: department?.name ?? 'Unknown',
            },
            avgRating,
            reports: reports.map((report: Report) => ({
              month: report.month,
              ranking: report.ranking,
              summary: report.summary
            }))
          };
        }
      }
    });

    return NextResponse.json({
      hasMissingReports: false,
      bestEmployee,
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