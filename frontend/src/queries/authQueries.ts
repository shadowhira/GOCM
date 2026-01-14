import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useClearAuth, useSetAuth } from '@/store/auth';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/auth';

/**
 * Authentication queries following TanStack Query pattern from ARCHITECTURE_STANDARDS.md
 */

// Auth query keys for cache management
export const authKeys = {
  all: ['auth'] as const,
  login: () => [...authKeys.all, 'login'] as const,
  register: () => [...authKeys.all, 'register'] as const,
  forgotPassword: () => [...authKeys.all, 'forgot-password'] as const,
  resetPassword: () => [...authKeys.all, 'reset-password'] as const,
};

// Login mutation
export const useLogin = () => {
  const setAuth = useSetAuth();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      // Update auth store
      setAuth(response.user, response.token);
    },
  });
};

// Register mutation 
export const useRegister = () => {
  const setAuth = useSetAuth();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      // Auto login after successful registration
      setAuth(response.user, response.token);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const clearAuth = useClearAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // If you have a logout API endpoint, call it here
      // await authApi.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear auth store
      clearAuth();
      // Clear all cached queries to prevent data leakage between accounts
      // This removes notifications, calendar, and all other user-specific data
      queryClient.clear();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationKey: authKeys.resetPassword(),
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });
};