import queryKeys from '@/constants/QueryKeys';
import {
    addDepartment,
    checkDepartmentInUse,
    deleteDepartment,
    fetchOrganization,
    updateOrganization,
} from '@/services/organization.services';
import { Organization } from '@/types';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

// Organization hooks
export const useOrganization = (options?: UseQueryOptions<Organization>) => {
    return useQuery({
        queryKey: [queryKeys.organization],
        queryFn: fetchOrganization,
        ...options,
    });
};

export const useUpdateOrganization = (
    options?: UseMutationOptions<
        Organization,
        Error,
        Partial<Organization>
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateOrganization,
        onSuccess: (updatedOrganization) => {
            queryClient.setQueryData(
                [queryKeys.organization],
                updatedOrganization
            );
        },
        ...options,
    });
};

export const useAddDepartment = (
    options?: UseMutationOptions<
        Organization,
        Error,
        string
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addDepartment,
        onSuccess: (updatedOrganization) => {
            queryClient.setQueryData(
                [queryKeys.organization],
                updatedOrganization
            );
            
            queryClient.invalidateQueries({
                queryKey: [queryKeys.organization],
            });
            
            queryClient.invalidateQueries({
                queryKey: [queryKeys.departments],
            });
        },
        ...options,
    });
};

export const useDeleteDepartment = (
    options?: UseMutationOptions<
        Organization,
        Error,
        string
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteDepartment,
        onSuccess: (updatedOrganization) => {
            queryClient.setQueryData(
                [queryKeys.organization],
                updatedOrganization
            );
            
            queryClient.invalidateQueries({
                queryKey: [queryKeys.organization],
            });
            
            queryClient.invalidateQueries({
                queryKey: [queryKeys.departments],
            });
        },
        ...options,
    });
};

export const useCheckDepartmentInUse = (
    departmentName: string,
    options?: Omit<UseQueryOptions<{ inUse: boolean }, Error, { inUse: boolean }>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<{ inUse: boolean }, Error>({
        queryKey: [queryKeys.departments, 'inUse', departmentName],
        queryFn: () => checkDepartmentInUse(departmentName),
        // Don't refetch automatically
        staleTime: Infinity,
        ...options,
    });
}; 