import queryKeys from '@/constants/QueryKeys';
import { fetchEmployeeReports, fetchSpecificReport, generateEmployeeReport } from '@/services/report.services';
import { PerformanceReport } from '@/types';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

// Hook to fetch all reports for an employee
export const useEmployeeReports = (
    employeeId: string,
    options?: Omit<UseQueryOptions<PerformanceReport[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: [queryKeys.reportsByEmployee(employeeId)],
        queryFn: () => fetchEmployeeReports(employeeId),
        enabled: !!employeeId,
        ...options,
    });
};

// Hook to fetch a specific report by employee and month
export const useSpecificReport = (
    employeeId: string,
    month: string,
    options?: Omit<UseQueryOptions<PerformanceReport | null>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: [queryKeys.reportByEmployeeAndMonth(employeeId, month)],
        queryFn: () => fetchSpecificReport(employeeId, month),
        enabled: !!employeeId && !!month,
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
            // Update both the specific report cache and the all reports cache
            queryClient.setQueryData([queryKeys.reportByEmployeeAndMonth(data.employeeId, data.month)], data);
            queryClient.invalidateQueries({ queryKey: [queryKeys.reportsByEmployee(data.employeeId)] });
        },
        ...options,
    });
}; 