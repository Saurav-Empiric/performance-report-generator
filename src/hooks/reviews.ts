import queryKeys from '@/constants/QueryKeys';
import {
    createReview,
    deleteReview,
    fetchReviewById,
    fetchReviews,
    fetchReviewsByEmployeeId,
    fetchReviewsByReviewerId,
    updateReview
} from '@/services/review.services';
import { Review } from '@/types';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

// Review hooks
export const useReviews = (options?: UseQueryOptions<Review[]>) => {
    return useQuery({
        queryKey: [queryKeys.reviews],
        queryFn: fetchReviews,
        ...options,
    });
};

export const useReviewsByEmployee = (
    employeeId: string,
    options?: UseQueryOptions<Review[]>
) => {
    return useQuery({
        queryKey: queryKeys.reviewsByEmployee(employeeId),
        queryFn: () => fetchReviewsByEmployeeId(employeeId),
        ...options,
    });
};

export const useReviewsByReviewer = (
    reviewerId: string,
    options?: UseQueryOptions<Review[]>
) => {
    return useQuery({
        queryKey: queryKeys.reviewsByReviewer(reviewerId),
        queryFn: () => fetchReviewsByReviewerId(reviewerId),
        ...options,
    });
};

export const useReview = (id: string, options?: UseQueryOptions<Review>) => {
    return useQuery({
        queryKey: queryKeys.review(id),
        queryFn: () => fetchReviewById(id),
        ...options,
    });
};

export const useCreateReview = (
    options?: UseMutationOptions<
        Review,
        Error,
        Omit<Review, '_id'>
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReview,
        onSuccess: (newReview) => {
            queryClient.setQueryData<Review[]>(
                [queryKeys.reviews],
                (old) => old ? [...old, newReview] : [newReview]
            );

            // Update targetEmployee reviews cache if it exists
            const targetEmployeeId = typeof newReview.targetEmployee === 'string'
                ? newReview.targetEmployee
                : newReview.targetEmployee._id;

            queryClient.setQueryData<Review[]>(
                queryKeys.reviewsByEmployee(targetEmployeeId),
                (old) => old ? [...old, newReview] : [newReview]
            );

            // Update reviewedBy reviews cache if it exists
            if (newReview.reviewedBy) {
                const reviewerId = typeof newReview.reviewedBy === 'string'
                    ? newReview.reviewedBy
                    : newReview.reviewedBy._id;

                queryClient.setQueryData<Review[]>(
                    queryKeys.reviewsByReviewer(reviewerId),
                    (old) => old ? [...old, newReview] : [newReview]
                );
            }
        },
        ...options,
    });
};

export const useUpdateReview = (
    options?: UseMutationOptions<
        Review,
        Error,
        { id: string; data: Partial<Review> }
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateReview(id, data),
        onSuccess: (updatedReview) => {
            queryClient.setQueryData<Review[]>(
                [queryKeys.reviews],
                (old) => old ? old.map(review =>
                    review._id === updatedReview._id ? updatedReview : review
                ) : [updatedReview]
            );

            queryClient.setQueryData(
                queryKeys.review(updatedReview._id),
                updatedReview
            );

            // Update targetEmployee reviews cache if it exists
            const targetEmployeeId = typeof updatedReview.targetEmployee === 'string'
                ? updatedReview.targetEmployee
                : updatedReview.targetEmployee._id;

            queryClient.invalidateQueries({
                queryKey: queryKeys.reviewsByEmployee(targetEmployeeId)
            });

            // Update reviewedBy reviews cache if it exists
            if (updatedReview.reviewedBy) {
                const reviewerId = typeof updatedReview.reviewedBy === 'string'
                    ? updatedReview.reviewedBy
                    : updatedReview.reviewedBy._id;

                queryClient.invalidateQueries({
                    queryKey: queryKeys.reviewsByReviewer(reviewerId)
                });
            }
        },
        ...options,
    });
};

export const useDeleteReview = (
    options?: UseMutationOptions<
        { message: string },
        Error,
        string
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteReview,
        onSuccess: (_, id) => {
            queryClient.setQueryData<Review[]>(
                [queryKeys.reviews],
                (old) => old ? old.filter(review => review._id !== id) : []
            );
            queryClient.removeQueries({ queryKey: queryKeys.review(id) });
        },
        ...options,
    });
}; 