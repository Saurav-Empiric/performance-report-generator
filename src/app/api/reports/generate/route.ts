import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Report from '@/lib/models/report';
import Employee from '@/lib/models/employee';
import Review from '@/lib/models/review';
import { generatePerformanceReport } from '@/services/gemini.services';

// Helper to check if the ID is valid
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Helper to validate month format (YYYY-MM)
function isValidMonth(month: string) {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(month)) return false;

  const [year, monthNum] = month.split('-').map(Number);
  if (monthNum < 1 || monthNum > 12) return false;

  return true;
}

// POST to generate a report
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, month } = body;

    // Validate required fields
    if (!employeeId || !month) {
      return NextResponse.json(
        { error: 'Employee ID and month are required fields' },
        { status: 400 }
      );
    }

    // Validate ID format
    if (!isValidObjectId(employeeId)) {
      return NextResponse.json(
        { error: 'Invalid employee ID format' },
        { status: 400 }
      );
    }

    // Validate month format
    if (!isValidMonth(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if a report already exists for this employee and month
    const existingReport = await Report.findOne({
      employeeId,
      month
    });

    if (existingReport) {
      return NextResponse.json({
        _id: existingReport._id.toString(),
        employeeId: existingReport.employeeId.toString(),
        month: existingReport.month,
        ranking: existingReport.ranking,
        improvements: existingReport.improvements,
        qualities: existingReport.qualities,
        summary: existingReport.summary,
        createdAt: existingReport.createdAt,
        updatedAt: existingReport.updatedAt
      }, { status: 200 });
    }

    // No existing report, so we need to generate one
    // Directly query the database instead of using fetch
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get the start and end dates for the month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59); // Last day of the month

    // Get reviews for this employee directly from the database
    const reviews = await Review.find({
      targetEmployee: employeeId,
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    });

    if (reviews.length === 0) {
      return NextResponse.json(
        { error: `No reviews found for ${employee.name} in ${month}` },
        { status: 404 }
      );
    }

    // Extract review contents
    const reviewContents = reviews.map(review => review.content);

    // Generate a report using Gemini AI
    const performanceReport = await generatePerformanceReport(
      reviewContents,
      employee.name,
      employee.role
    );

    // Save the report to the database
    const newReport = new Report({
      employeeId,
      month,
      ranking: performanceReport.ranking,
      improvements: performanceReport.improvements,
      qualities: performanceReport.qualities,
      summary: performanceReport.summary
    });

    await newReport.save();

    return NextResponse.json({
      _id: newReport._id.toString(),
      employeeId: newReport.employeeId.toString(),
      month: newReport.month,
      ranking: newReport.ranking,
      improvements: newReport.improvements,
      qualities: newReport.qualities,
      summary: newReport.summary,
      createdAt: newReport.createdAt,
      updatedAt: newReport.updatedAt
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to generate report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 