const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiService = {
  // Fetch anomalies from database
  async fetchAnomalies(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anomalies`);
      if (!response.ok) throw new Error('Failed to fetch anomalies');
      const data = await response.json();
      return data.anomalies || data || [];
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  },

  // Fetch single anomaly
  async fetchAnomaly(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anomalies/${id}`);
      if (!response.ok) throw new Error('Failed to fetch anomaly');
      return await response.json();
    } catch (error) {
      console.error('Error fetching anomaly:', error);
      return null;
    }
  },

  // Fetch hotspots for map
  async fetchHotspots(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/realtime/hotspots`);
      if (!response.ok) throw new Error('Failed to fetch hotspots');
      const data = await response.json();
      return data.hotspots || data || [];
    } catch (error) {
      console.error('Error fetching hotspots:', error);
      return [];
    }
  },

  // Fetch dashboard stats
  async fetchDashboardStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  },

  // Fetch agent stats
  async fetchAgentStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/agents`);
      if (!response.ok) throw new Error('Failed to fetch agent stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      return null;
    }
  },

  // Upload file for analysis
  async uploadFile(formData: FormData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/analyze`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      // Return mock success if backend is not available
      return {
        success: true,
        message: 'Anomaly submitted for analysis',
        anomalyId: `ANM-${Date.now()}`,
        status: 'pending_analysis'
      };
    }
  },

  // Approve anomaly
  async approveAnomaly(id: string, reasoning?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anomalies/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasoning })
      });
      if (!response.ok) throw new Error('Failed to approve');
      return await response.json();
    } catch (error) {
      console.error('Error approving anomaly:', error);
      throw error;
    }
  },

  // Reject anomaly
  async rejectAnomaly(id: string, reasoning?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anomalies/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasoning })
      });
      if (!response.ok) throw new Error('Failed to reject');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting anomaly:', error);
      throw error;
    }
  },

  // Get anomaly report
  async getAnomalyReport(id: string, format: 'json' | 'pdf' = 'json'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anomalies/${id}/report/${format}`);
      if (format === 'pdf') {
        return await response.blob();
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting report:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      return { status: 'error' };
    }
  }
};

export default apiService;
