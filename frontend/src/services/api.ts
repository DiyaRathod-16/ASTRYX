import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('astryx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('astryx_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Anomaly API
export const anomalyApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    severity?: string;
    status?: string;
    search?: string;
  }) => api.get('/anomalies', { params }),

  getById: (id: string) => api.get(`/anomalies/${id}`),

  getStats: () => api.get('/anomalies/stats/overview'),

  create: (data: any) => api.post('/anomalies', data),

  update: (id: string, data: any) => api.put(`/anomalies/${id}`, data),

  approve: (id: string) => api.post(`/anomalies/${id}/approve`),

  reject: (id: string, reason?: string) => 
    api.post(`/anomalies/${id}/reject`, { reason }),

  getReport: (id: string, format: 'json' | 'pdf') => 
    api.get(`/anomalies/${id}/report/${format}`),

  delete: (id: string) => api.delete(`/anomalies/${id}`),
};

// Workflow API
export const workflowApi = {
  getAll: (params?: { status?: string; type?: string }) => 
    api.get('/workflows', { params }),

  getById: (id: string) => api.get(`/workflows/${id}`),

  getTemplates: () => api.get('/workflows/templates/list'),

  create: (data: any) => api.post('/workflows', data),

  createFromTemplate: (templateName: string, customizations?: any) =>
    api.post('/workflows/from-template', { templateName, customizations }),

  update: (id: string, data: any) => api.put(`/workflows/${id}`, data),

  activate: (id: string) => api.post(`/workflows/${id}/activate`),

  deactivate: (id: string) => api.post(`/workflows/${id}/deactivate`),

  execute: (id: string, input?: any) => 
    api.post(`/workflows/${id}/execute`, { input }),

  getExecutions: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/workflows/${id}/executions`, { params }),

  delete: (id: string) => api.delete(`/workflows/${id}`),
};

// Data Source API
export const dataSourceApi = {
  getAll: (params?: { status?: string; type?: string }) =>
    api.get('/data-sources', { params }),

  getById: (id: string) => api.get(`/data-sources/${id}`),

  getStats: () => api.get('/data-sources/stats'),

  create: (data: any) => api.post('/data-sources', data),

  update: (id: string, data: any) => api.put(`/data-sources/${id}`, data),

  activate: (id: string) => api.post(`/data-sources/${id}/activate`),

  deactivate: (id: string) => api.post(`/data-sources/${id}/deactivate`),

  fetch: (id: string) => api.post(`/data-sources/${id}/fetch`),

  triggerAll: () => api.post('/data-sources/trigger-all'),

  delete: (id: string) => api.delete(`/data-sources/${id}`),
};

// Health API
export const healthApi = {
  check: () => api.get('/health'),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),

  me: () => api.get('/auth/me'),

  updateProfile: (data: any) => api.put('/auth/me', data),
};
