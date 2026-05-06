export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'NGO' | 'HOSPITAL' | 'ADMIN';
  profilePhoto?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: string;
}
