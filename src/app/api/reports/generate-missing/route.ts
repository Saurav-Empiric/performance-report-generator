import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePerformanceReport } from '@/services/gemini.services';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, months } = body;

    // Validate required fields
    if (!employeeId || !months || !Array.isArray(months) || months.length === 0) {
      return NextResponse.json(
        { error: 'Employee ID and months array are required fields' },
        { status: 400 }
      );
    }

    // Validate month format
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    for (const month of months) {
      if (!monthRegex.test(month)) {
        return NextResponse.json(
          { error: `Invalid month format: ${month}. Use YYYY-MM` },
          { status: 400 }
        );
      }
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

    // Get employee details
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, name, role, organization_id')
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      console.error('Error fetching employee:', empError);
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Verify employee belongs to the same organization
    if (employee.organization_id !== orgData.id) {
      return NextResponse.json(
        { error: 'Employee not found in your organization' },
        { status: 403 }
      );
    }

    const generatedReports = [];
    const failedMonths = [];

    // Process each month
    for (const month of months) {
      // Check if a report already exists for this employee and month
      const { data: existingReport } = await supabase
        .from('reports')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('month', month)
        .single();

      if (existingReport) {
        // Skip if report already exists
        generatedReports.push({
          _id: existingReport.id,
          employeeId: existingReport.employee_id,
          month: existingReport.month,
          ranking: existingReport.ranking,
          improvements: existingReport.improvements,
          qualities: existingReport.qualities,
          summary: existingReport.summary,
          createdAt: existingReport.created_at,
          updatedAt: existingReport.created_at
        });
        continue;
      }

      // Get the start and end dates for the month
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59); // Last day of the month

      // Get reviews for this employee for the specified month
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('content')
        .eq('target_employee_id', employeeId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (reviewsError) {
        console.error(`Error fetching reviews for ${month}:`, reviewsError);
        failedMonths.push({ month, error: 'Failed to fetch reviews' });
        continue;
      }

      let performanceReport;
      
      if (!reviews || reviews.length === 0) {
        // No reviews found for this month, create a report with 0 rating
        performanceReport = {
          ranking: 0,
          improvements: [],
          qualities: [],
          summary: `No reviews available for ${employee.name} in ${month}.`
        };
      } else {
        // Extract review contents
        const reviewContents = reviews.map(review => review.content);

        // Generate a report using Gemini AI
        try {
          performanceReport = await generatePerformanceReport(
            reviewContents,
            employee.name,
            employee.role
          );
        } catch (error) {
          console.error(`Error generating report for ${month}:`, error);
          failedMonths.push({ month, error: 'Failed to generate report' });
          continue;
        }
      }

      // Save the report to the database
      const { data: newReport, error: insertError } = await supabase
        .from('reports')
        .insert({
          employee_id: employeeId,
          month: month,
          ranking: performanceReport.ranking,
          improvements: performanceReport.improvements,
          qualities: performanceReport.qualities,
          summary: performanceReport.summary
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Error saving report for ${month}:`, insertError);
        failedMonths.push({ month, error: 'Failed to save report' });
        continue;
      }

      generatedReports.push({
        _id: newReport.id,
        employeeId: newReport.employee_id,
        month: newReport.month,
        ranking: newReport.ranking,
        improvements: newReport.improvements,
        qualities: newReport.qualities,
        summary: newReport.summary,
        createdAt: newReport.created_at,
        updatedAt: newReport.created_at
      });
    }

    return NextResponse.json({
      generatedReports,
      failedMonths,
      success: generatedReports.length > 0
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to generate reports:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate reports';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 