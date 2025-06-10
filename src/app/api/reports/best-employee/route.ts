import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Define interfaces for our data structures
interface Employee {
  id: string;
  name: string;
  role: string;
  department_id: string;
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
  department_id?: string;
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
            department_id: employee.department_id
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

    // Calculate average ratings and find the best employees overall
    const bestEmployees: BestEmployeeData[] = [];
    let bestAvgRating = -1;

    // Create a map to track best employees by department
    const departmentBestEmployees = new Map<string, BestEmployeeData[]>();

    // Group employees by department for easier access
    const employeesByDepartment = new Map<string, Employee[]>();
    employees.forEach(employee => {
      if (employee.department_id) {
        const deptEmployees = employeesByDepartment.get(employee.department_id) || [];
        deptEmployees.push(employee);
        employeesByDepartment.set(employee.department_id, deptEmployees);
      }
    });

    employees.forEach(employee => {
      const reports = employeeReportsMap.get(employee.id) || [];
      if (reports.length === months.length) { // Only consider employees with all required reports
        const totalRating = reports.reduce((sum: number, report: Report) => sum + report.ranking, 0);
        const avgRating = totalRating / reports.length;

        const department = departments?.find(dept => dept.id === employee.department_id);

        const employeeData: BestEmployeeData = {
          employee: {
            id: employee.id,
            name: employee.name,
            role: employee.role,
            department: department?.name ?? 'Unknown',
            department_id: employee.department_id
          },
          avgRating,
          reports: reports.map((report: Report) => ({
            month: report.month,
            ranking: report.ranking,
            summary: report.summary
          }))
        };

        // Check if this is one of the best overall employees
        if (avgRating > bestAvgRating) {
          // Found a new highest rating
          bestAvgRating = avgRating;
          bestEmployees.length = 0; // Clear previous best employees
          bestEmployees.push(employeeData);
        } else if (avgRating === bestAvgRating) {
          // Another employee with the same highest rating
          bestEmployees.push(employeeData);
        }

        // Check if this is one of the best employees in their department
        if (employee.department_id) {
          const deptBestEmployees = departmentBestEmployees.get(employee.department_id) || [];

          if (deptBestEmployees.length === 0) {
            // First employee for this department
            departmentBestEmployees.set(employee.department_id, [employeeData]);
          } else {
            const deptBestRating = deptBestEmployees[0].avgRating;

            if (avgRating > deptBestRating) {
              // New best rating for department
              departmentBestEmployees.set(employee.department_id, [employeeData]);
            } else if (avgRating === deptBestRating) {
              // Tie for best in department
              deptBestEmployees.push(employeeData);
              departmentBestEmployees.set(employee.department_id, deptBestEmployees);
            }
          }
        }
      }
    });

    // Convert department best employees map to array for the response
    const bestEmployeesByDepartment: Array<{
      department: { id: string; name: string };
      bestEmployees: BestEmployeeData[];
    }> = [];

    departmentBestEmployees.forEach((deptBestEmployees, deptId) => {
      const department = departments?.find(d => d.id === deptId);
      if (department) {
        bestEmployeesByDepartment.push({
          department: { id: department.id, name: department.name },
          bestEmployees: deptBestEmployees
        });
      }
    });

    return NextResponse.json({
      hasMissingReports: false,
      bestEmployees,
      bestEmployeesByDepartment,
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