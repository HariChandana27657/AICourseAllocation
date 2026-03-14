import type { User } from '../types';

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const isStudent = (): boolean => {
  const user = getUser();
  return user?.role === 'student';
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'admin';
};
