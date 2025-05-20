import queryKeys from '@/constants/QueryKeys';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

interface PerformanceReport {
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

// Fetch reports for an employee
const fetchEmployeeReports = async (employeeId: string): Promise<PerformanceReport[]> => {
    const response = await fetch(`/api/reports?employeeId=${employeeId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch employee reports');
    }
    return response.json();
};

// Generate a report for an employee for a specific month
const generateEmployeeReport = async ({
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

// Hook to fetch all reports for an employee
export const useEmployeeReports = (
    employeeId: string, 
    options?: Omit<UseQueryOptions<PerformanceReport[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['reports', employeeId],
        queryFn: () => fetchEmployeeReports(employeeId),
        enabled: !!employeeId,
        ...options,
    });
};

// Hook to generate a report
export const useGenerateReport = (
    options?: UseMutationOptions<
        PerformanceReport,
        Error,
        { employeeId: string; month: string }
    >
) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: generateEmployeeReport,
        onSuccess: (data) => {
            // Update the reports cache
            queryClient.invalidateQueries({ queryKey: ['reports', data.employeeId] });
        },
        ...options,
    });
}; 