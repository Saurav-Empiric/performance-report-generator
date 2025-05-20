import { PerformanceReport, generatePerformanceReport } from './gemini.services';
import Report from '@/lib/models/report';
import { fetchEmployeeById } from './employee.services';
import { fetchReviewsByEmployeeId } from './review.services';
import connectToDatabase from '@/lib/db';

interface MonthlyReport {
  _id?: string;
  employeeId: string;
  month: string;
  ranking: number;
  improvements: string[];
  qualities: string[];
  summary: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get or generate a performance report for an employee for a specific month
 * @param employeeId The ID of the employee
 * @param month The month in YYYY-MM format
 * @returns Promise with the performance report
 */
export const getEmployeeMonthlyReport = async (
  employeeId: string,
  month: string
): Promise<MonthlyReport> => {
  await connectToDatabase();
  
  // Check if a report already exists for this employee and month
  const existingReport = await Report.findOne({ 
    employeeId, 
    month 
  });
  
  if (existingReport) {
    return {
      _id: existingReport._id.toString(),
      employeeId: existingReport.employeeId.toString(),
      month: existingReport.month,
      ranking: existingReport.ranking,
      improvements: existingReport.improvements,
      qualities: existingReport.qualities,
      summary: existingReport.summary,
      createdAt: existingReport.createdAt,
      updatedAt: existingReport.updatedAt
    };
  }
  
  // No existing report, so we need to generate one
  const employee = await fetchEmployeeById(employeeId);
  
  // Get the start and end dates for the month
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59); // Last day of the month
  
  // Get reviews for this employee in the specified month
  const reviews = await fetchReviewsByEmployeeId(employeeId);
  
  // Filter reviews for the specified month
  const monthlyReviews = reviews.filter(review => {
    const reviewDate = new Date(review.timestamp);
    return reviewDate >= startDate && reviewDate <= endDate;
  });
  
  if (monthlyReviews.length === 0) {
    throw new Error(`No reviews found for ${employee.name} in ${month}`);
  }
  
  // Extract review contents
  const reviewContents = monthlyReviews.map(review => review.content);
  
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
  
  return {
    _id: newReport._id.toString(),
    employeeId: newReport.employeeId.toString(),
    month: newReport.month,
    ranking: newReport.ranking,
    improvements: newReport.improvements,
    qualities: newReport.qualities,
    summary: newReport.summary,
    createdAt: newReport.createdAt,
    updatedAt: newReport.updatedAt
  };
};

/**
 * Get all reports for an employee
 * @param employeeId The ID of the employee
 * @returns Promise with an array of performance reports
 */
export const getAllEmployeeReports = async (
  employeeId: string
): Promise<MonthlyReport[]> => {
  await connectToDatabase();
  
  const reports = await Report.find({ employeeId }).sort({ month: -1 });
  
  return reports.map(report => ({
    _id: report._id.toString(),
    employeeId: report.employeeId.toString(),
    month: report.month,
    ranking: report.ranking,
    improvements: report.improvements,
    qualities: report.qualities,
    summary: report.summary,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt
  }));
}; 