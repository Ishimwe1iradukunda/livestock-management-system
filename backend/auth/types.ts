export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role?: 'admin' | 'user';
}