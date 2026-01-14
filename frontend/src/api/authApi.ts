import httpClient from '@/lib/axios';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiMessageResponse,
} from '@/types/auth';

/**
 * Authentication API following established pattern from classApi.ts
 */
export const authApi = {
  // POST /api/Authentication/login
  login: (data: LoginRequest): Promise<LoginResponse> => 
    httpClient.post('/Authentication/login', data),

  // POST /api/Authentication/register  
  register: (data: RegisterRequest): Promise<RegisterResponse> => 
    httpClient.post('/Authentication/register', data),

  // POST /api/Authentication/forgot-password
  forgotPassword: (data: ForgotPasswordRequest): Promise<ApiMessageResponse> =>
    httpClient.post('/Authentication/forgot-password', data),

  // POST /api/Authentication/reset-password
  resetPassword: (data: ResetPasswordRequest): Promise<ApiMessageResponse> =>
    httpClient.post('/Authentication/reset-password', data),
};