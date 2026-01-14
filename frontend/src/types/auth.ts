/**
 * Authentication types based on backend API structure
 */

// Role enum matching backend (Admin = 0, User = 1)
export enum Role {
  Admin = 0,
  User = 1,
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Response types  
export interface UserResponse {
  id: number;
  avatarUrl: string;
  displayName: string;
  email: string;
  role: Role; // 0 = Admin, 1 = User
  custom: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: UserResponse;
}

export interface ApiMessageResponse {
  message: string;
}

// Form types for frontend validation
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}