export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'counselor' | 'teacher' | 'observer';
  institution: string;
  isActive: number;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'counselor' | 'teacher' | 'observer';
  institution: string;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: UserPublic;
  message?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'counselor' | 'teacher' | 'observer';
  institution: string;
}
