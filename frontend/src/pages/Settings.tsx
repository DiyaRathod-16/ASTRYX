import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { healthApi } from '../services/api';
import { useAnomalyStore } from '../stores';

export default function Settings() {
  const { autonomousMode, setAutonomousMode } = useAnomalyStore();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await healthApi.check();
      setHealth(response.data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutonomousMode = () => {
    setAutonomousMode(!autonomousMode);
    toast.success(`Autonomous mode ${!autonomousMode ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Configure ASTRYX system settings</p>
      </div>

      {/* Autonomous Mode */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Autonomous Mode</h3>
            <p className="text-sm text-gray-400 max-w-lg">
              When enabled, ASTRYX will automatically process, analyze, and approve anomalies
              that meet the confidence threshold without human intervention.
            </p>
          </div>
          <button
            onClick={toggleAutonomousMode}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autonomousMode ? 'bg-primary-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                autonomousMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {autonomousMode && (
          <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
            <p className="text-sm text-primary-400">
              ⚡ Autonomous mode is active. High-confidence anomalies will be auto-approved.
            </p>
          </div>
        )}
      </div>

      {/* System Health */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded w-48" />
            ))}
          </div>
        ) : health ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${
                health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-white font-medium">
                {health.status === 'healthy' ? 'System Healthy' : 'System Issues Detected'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400">Environment</p>
                <p className="text-white capitalize">{health.environment}</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400">Uptime</p>
                <p className="text-white">
                  {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
                </p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400">Memory Usage</p>
                <p className="text-white">
                  {health.memory?.used || 0} / {health.memory?.total || 0} MB
                </p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400">WebSocket Clients</p>
                <p className="text-white">
                  {health.services?.websocket?.connectedClients || 0}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Services</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(health.services || {}).map(([name, service]: [string, any]) => (
                  <div key={name} className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
                    <span className={`w-2 h-2 rounded-full ${
                      service.status === 'healthy' || service.status === 'active' || service.status === 'configured'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`} />
                    <span className="text-gray-300 capitalize">{name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Failed to load health status</p>
        )}
      </div>

      {/* Configuration Info */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">Auto-approve Threshold</span>
            <span className="text-white">95%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">Ingestion Schedule</span>
            <span className="text-white">Every 15 minutes</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">Rate Limit</span>
            <span className="text-white">100 requests / 15 min</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Version</span>
            <span className="text-white">1.0.0</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-2">About ASTRYX</h3>
        <p className="text-sm text-gray-400">
          ASTRYX (Autonomous System for Threat Recognition & Yielded eXecution) is an 
          enterprise-grade autonomous anomaly detection and response system powered by 
          Google Gemini multimodal AI and Opus workflow orchestration for real-time 
          global anomaly detection and response.
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span>Built with React + TypeScript</span>
          <span>•</span>
          <span>Node.js Backend</span>
          <span>•</span>
          <span>PostgreSQL + Redis</span>
        </div>
      </div>
    </div>
  );
}
