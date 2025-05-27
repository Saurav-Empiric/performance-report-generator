import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  AuthResponse,
  SignInCredentials,
  SignUpData,
  getCurrentUser,
  resetPassword,
  signInWithEmailPassword,
  signOut,
  signUpWithEmailPassword,
  updatePassword,
} from '@/services/auth.services';
import queryKeys from '@/constants/QueryKeys';
import { User } from '@supabase/supabase-js';

// Query hook to get the current user
export const useCurrentUser = (
  options?: Omit<UseQueryOptions<{ user: User | null; error?: string }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [queryKeys.user],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Mutation hook to sign in
export const useSignIn = (
  options?: UseMutationOptions<AuthResponse, Error, SignInCredentials>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signInWithEmailPassword,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData([queryKeys.user], { user: data.user });
        queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
      }
    },
    ...options,
  });
};

// Mutation hook to sign up
export const useSignUp = (
  options?: UseMutationOptions<AuthResponse, Error, SignUpData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUpWithEmailPassword,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData([queryKeys.user], { user: data.user });
        queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
      }
    },
    ...options,
  });
};

// Mutation hook to sign out
export const useSignOut = (
  options?: UseMutationOptions<{ message?: string; error?: string }, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData([queryKeys.user], { user: null });
      queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
      // Invalidate all queries that depend on authentication
      queryClient.invalidateQueries({ queryKey: [queryKeys.organization] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.employees] });
    },
    ...options,
  });
};

// Mutation hook to reset password
export const useResetPassword = (
  options?: UseMutationOptions<{ message?: string; error?: string }, Error, string>
) => {
  return useMutation({
    mutationFn: resetPassword,
    ...options,
  });
};

// Mutation hook to update password
export const useUpdatePassword = (
  options?: UseMutationOptions<{ message?: string; error?: string }, Error, string>
) => {
  return useMutation({
    mutationFn: updatePassword,
    ...options,
  });
}; 