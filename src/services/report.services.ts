import { PerformanceReport } from "@/types";

// Fetch reports for an employee
export const fetchEmployeeReports = async (employeeId: string): Promise<PerformanceReport[]> => {
    const response = await fetch(`/api/reports?employeeId=${employeeId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch employee reports');
    }
    return response.json();
};
// Fetch a specific report by employee ID and month
export const fetchSpecificReport = async (employeeId: string, month: string): Promise<PerformanceReport | null> => {
    const response = await fetch(`/api/reports/${employeeId}/${month}`);
    if (!response.ok) {
        throw new Error('Failed to fetch report');
    }
    const data = await response.json();
    return data; // Will be null if no report exists
};

// Generate a report for an employee for a specific month
export const generateEmployeeReport = async ({
    employeeId,
    month,
}: {
    employeeId: string;
    month: string;
}): Promise<PerformanceReport> => {
    const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, month }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
    }
    
    return response.json();
};
