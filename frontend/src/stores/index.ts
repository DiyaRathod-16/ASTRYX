import { create } from 'zustand';
import { anomalyApi, workflowApi } from '../services/api';

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  confidence: number;
  latitude: number;
  longitude: number;
  location: string;
  sourceType: string;
  rawData: object;
  aiAnalysis: object | null;
  mediaUrls: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  critical: number;
  high: number;
  pending: number;
  last24Hours: number;
  byType: { type: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
}

interface AnomalyStore {
  anomalies: Anomaly[];
  selectedAnomaly: Anomaly | null;
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  autonomousMode: boolean;
  
  fetchAnomalies: (params?: any) => Promise<void>;
  fetchAnomaly: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  addAnomaly: (anomaly: Anomaly) => void;
  updateAnomaly: (anomaly: Anomaly) => void;
  removeAnomaly: (id: string) => void;
  approveAnomaly: (id: string) => Promise<void>;
  rejectAnomaly: (id: string, reason?: string) => Promise<void>;
  setAutonomousMode: (enabled: boolean) => void;
  clearError: () => void;
}

export const useAnomalyStore = create<AnomalyStore>((set, get) => ({
  anomalies: [],
  selectedAnomaly: null,
  stats: null,
  loading: false,
  error: null,
  autonomousMode: false,

  fetchAnomalies: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await anomalyApi.getAll(params);
      set({ anomalies: response.data.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch anomalies',
        loading: false 
      });
    }
  },

  fetchAnomaly: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await anomalyApi.getById(id);
      set({ selectedAnomaly: response.data.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch anomaly',
        loading: false 
      });
    }
  },

  fetchStats: async () => {
    try {
      const response = await anomalyApi.getStats();
      set({ stats: response.data.data });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  },

  addAnomaly: (anomaly) => {
    set((state) => ({
      anomalies: [anomaly, ...state.anomalies]
    }));
  },

  updateAnomaly: (anomaly) => {
    set((state) => ({
      anomalies: state.anomalies.map((a) => 
        a.id === anomaly.id ? anomaly : a
      ),
      selectedAnomaly: state.selectedAnomaly?.id === anomaly.id 
        ? anomaly 
        : state.selectedAnomaly
    }));
  },

  removeAnomaly: (id) => {
    set((state) => ({
      anomalies: state.anomalies.filter((a) => a.id !== id)
    }));
  },

  approveAnomaly: async (id) => {
    try {
      const response = await anomalyApi.approve(id);
      get().updateAnomaly(response.data.data);
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to approve' });
    }
  },

  rejectAnomaly: async (id, reason) => {
    try {
      const response = await anomalyApi.reject(id, reason);
      get().updateAnomaly(response.data.data);
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to reject' });
    }
  },

  setAutonomousMode: (enabled) => {
    set({ autonomousMode: enabled });
  },

  clearError: () => set({ error: null }),
}));

// Workflow Store
interface WorkflowStore {
  workflows: any[];
  templates: any[];
  loading: boolean;
  
  fetchWorkflows: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflows: [],
  templates: [],
  loading: false,

  fetchWorkflows: async () => {
    set({ loading: true });
    try {
      const response = await workflowApi.getAll();
      set({ workflows: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      const response = await workflowApi.getTemplates();
      set({ templates: response.data.data });
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  },
}));

// Notification Store
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  anomalyId?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  addNotification: (notification: Omit<Notification, 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification = { ...notification, read: false };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
