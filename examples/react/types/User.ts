export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface UserFormData {
  name: string;
  email: string;
  role: string;
}
