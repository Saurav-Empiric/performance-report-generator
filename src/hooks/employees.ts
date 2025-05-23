import queryKeys from '@/constants/QueryKeys';
import {
    createEmployee,
    deleteEmployee,
    fetchEmployeeById,
    fetchEmployees,
    updateEmployee,
} from '@/services/employee.services';
import { Employee } from '@/types';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

// Employee hooks
export const useEmployees = (options?: UseQueryOptions<Employee[]>) => {
    return useQuery({
        queryKey: [queryKeys.employees],
        queryFn: fetchEmployees,
        ...options,
    });
};

export const useEmployee = (id: string, options?: Partial<UseQueryOptions<Employee>>) => {
    return useQuery({
        queryKey: queryKeys.employee(id),
        queryFn: () => fetchEmployeeById(id),
        ...options,
    });
};

export const useCreateEmployee = (
    options?: UseMutationOptions<
        Employee,
        Error,
        Omit<Employee, '_id'>
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createEmployee,
        onSuccess: (newEmployee) => {
            queryClient.setQueryData<Employee[]>(
                [queryKeys.employees],
                (old) => old ? [...old, newEmployee] : [newEmployee]
            );
            queryClient.setQueryData(
                queryKeys.employee(newEmployee._id),
                newEmployee
            );
        },
        ...options,
    });
};

export const useUpdateEmployee = (
    options?: UseMutationOptions<
        Employee,
        Error,
        { id: string; data: Partial<Employee> }
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateEmployee(id, data),
        onSuccess: (updatedEmployee) => {
            queryClient.setQueryData<Employee[]>(
                [queryKeys.employees],
                (old) => old ? old.map(employee =>
                    employee._id === updatedEmployee._id ? updatedEmployee : employee
                ) : [updatedEmployee]
            );
            queryClient.setQueryData(
                queryKeys.employee(updatedEmployee._id),
                updatedEmployee
            );
        },
        ...options,
    });
};

export const useDeleteEmployee = (
    options?: UseMutationOptions<
        { message: string },
        Error,
        string
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteEmployee,
        onSuccess: (_, id) => {
            queryClient.setQueryData<Employee[]>(
                [queryKeys.employees],
                (old) => old ? old.filter(employee => employee._id !== id) : []
            );
            queryClient.removeQueries({ queryKey: queryKeys.employee(id) });
        },
        ...options,
    });
};
