import axios from 'axios';
import type { AuthResponse, Course, Preference, Enrollment, Report, Analytics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  studentLogin: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/student/login', { email, password }),
  
  studentRegister: (data: { name: string; email: string; department: string; gpa: number; password: string }) =>
    api.post<AuthResponse>('/auth/student/register', data),
  
  adminLogin: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/admin/login', { email, password }),
};

// Course API
export const courseAPI = {
  getAll: () => api.get<Course[]>('/courses'),
  getById: (id: number) => api.get<Course>(`/courses/${id}`),
  create: (data: Partial<Course>) => api.post<Course>('/courses', data),
  update: (id: number, data: Partial<Course>) => api.put<Course>(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

// Preference API
export const preferenceAPI = {
  get: () => api.get<Preference[]>('/preferences'),
  submit: (preferences: Array<{ course_id: number; preference_rank: number }>) =>
    api.post('/preferences', { preferences }),
  delete: () => api.delete('/preferences'),
};

// Allocation API
export const allocationAPI = {
  run: () => api.post('/allocation/run'),
  getResults: () => api.get<{ studentId: number; allocatedCourses: Enrollment[] }>('/allocation/results'),
};

// Chat API
export const chatAPI = {
  send: (message: string) => api.post('/chat', { message }),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
};

// Report API
export const reportAPI = {  getEnrollment: () => api.get<Report[]>('/reports/enrollment'),
  getUnallocated: () => api.get('/reports/unallocated'),
  getDemand: () => api.get<Report[]>('/reports/demand'),
  getAnalytics: () => api.get<Analytics>('/reports/analytics'),
  getAllPreferences: () => api.get('/reports/preferences'),
};

export default api;
