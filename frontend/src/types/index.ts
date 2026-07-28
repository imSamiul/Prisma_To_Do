// Type definitions for Prisma Todo

export interface User {
  id: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  isSystem: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  categoryId: string;
  userId: string;
  inMyDay: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
}
