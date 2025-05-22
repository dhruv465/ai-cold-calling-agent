// src/api/authApi.ts
import axios from './axios';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>('/users/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>('/users/register', userData);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await axios.get<User>('/users/profile');
  return response.data;
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await axios.put<{ message: string; user: User }>('/users/profile', userData);
  return response.data.user;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get<User[]>('/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await axios.get<User>(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await axios.put<{ message: string; user: User }>(`/users/${id}`, userData);
  return response.data.user;
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`/users/${id}`);
  return response.data;
};
