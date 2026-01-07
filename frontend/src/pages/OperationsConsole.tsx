import React, { useState, useEffect } from 'react';
import {
  Radio, Activity, Shield, AlertTriangle, Users,
  Zap, RefreshCw, Clock, Globe, Terminal, ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import SwarmVisualization from '../components/SwarmVisualization';
import MitigationPlanner from '../components/MitigationPlanner';
import FederatedIntelligence from '../components/FederatedIntelligence';

interface SystemStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;
  uptime: string;
}

interface WorkflowExecution {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  startedAt: string;
}

const OperationsConsole: React.FC = () => {
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'AI Core', status: 'online', latency: 12, uptime: '99.99%' },
    { name: 'Swarm Network', status: 'online', latency: 23, uptime: '99.95%' },
    { name: 'Data Pipeline', status: 'online', latency: 8, uptime: '99.98%' },
    { name: 'Alert System', status: 'online', latency: 15, uptime: '99.97%' },
    { name: 'Opus Engine', status: 'online', latency: 19, uptime: '99.92%' },
    { name: 'Intel Federation', status: 'degraded', latency: 67, uptime: '98.54%' }
  ]);

  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([
    { id: 'wf-001', name: 'Real-time Anomaly Detection', status: 'running', progress: 100, startedAt: '2 days ago' },
    { id: 'wf-002', name: 'Swarm Consensus Pipeline', status: 'running', progress: 100, startedAt: '2 days ago' },
    { id: 'wf-003', name: 'Threat Pattern Analysis', status: 'running', progress: 78, startedAt: '15m ago' },
    { id: 'wf-004', name: 'Infrastructure Mitigation', status: 'queued', progress: 0, startedAt: '-' },
    { id: 'wf-005', name: 'Daily Report Generation', status: 'completed', progress: 100, startedAt: '1h ago' }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAgents, setActiveAgents] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setActiveAgents(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'degraded': return 'bg-yellow-400';
      case 'offline': return 'bg-red-400';
      case 'running': return 'bg-cyan-400';
      case 'completed': return 'bg-green-400';
      case 'failed': return 'bg-red-400';
      case 'queued': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const totalLatency = Math.round(systems.reduce((acc, s) => acc + s.latency, 0) / systems.length);
  const onlineCount = systems.filter(s => s.status === 'online').length;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Operations Console</h1>
            <p className="text-gray-400">System monitoring and workflow orchestration</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />
              <span className="text-sm font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{onlineCount}/{systems.length}</div>
            <div className="text-sm text-gray-400">Systems Online</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{activeAgents}</div>
            <div className="text-sm text-gray-400">Active Agents</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalLatency}ms</div>
            <div className="text-sm text-gray-400">Avg Latency</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{workflows.filter(w => w.status === 'running').length}</div>
            <div className="text-sm text-gray-400">Running Workflows</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-sm text-gray-400">Fed. Nodes</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* System Status */}
          <div className="col-span-2 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">System Status</h3>
              <button className="p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {systems.map((system, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)} ${
                      system.status === 'online' ? 'animate-pulse' : ''
                    }`} />
                    <div>
                      <div className="text-white font-medium">{system.name}</div>
                      <div className="text-xs text-gray-500">{system.uptime} uptime</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      system.latency < 30 ? 'text-green-400' : 
                      system.latency < 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {system.latency}ms
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{system.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Swarm Status */}
          <SwarmVisualization />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Workflow Executions */}
          <div className="col-span-2 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Opus Workflow Executions</h3>
              </div>
              <button className="text-sm text-cyan-400 hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.status)} ${
                        workflow.status === 'running' ? 'animate-pulse' : ''
                      }`} />
                      <span className="text-white font-medium">{workflow.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500">{workflow.startedAt}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        workflow.status === 'running' ? 'bg-cyan-500/20 text-cyan-400' :
                        workflow.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        workflow.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {workflow.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {workflow.status === 'running' && workflow.progress < 100 && (
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-cyan-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Federated Intelligence */}
          <FederatedIntelligence />
        </div>

        {/* Mitigation Planner */}
        <div className="grid grid-cols-2 gap-6">
          <MitigationPlanner />
          
          {/* Quick Actions */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-left hover:bg-cyan-500/20 transition-all">
                <Activity className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-sm font-medium text-white">Run Diagnostics</div>
                <div className="text-xs text-gray-500">System health check</div>
              </button>
              <button className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-left hover:bg-purple-500/20 transition-all">
                <RefreshCw className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-sm font-medium text-white">Restart Agents</div>
                <div className="text-xs text-gray-500">Reset swarm network</div>
              </button>
              <button className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-left hover:bg-orange-500/20 transition-all">
                <AlertTriangle className="w-6 h-6 text-orange-400 mb-2" />
                <div className="text-sm font-medium text-white">Clear Alerts</div>
                <div className="text-xs text-gray-500">Dismiss all pending</div>
              </button>
              <button className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-left hover:bg-green-500/20 transition-all">
                <Shield className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-sm font-medium text-white">Security Scan</div>
                <div className="text-xs text-gray-500">Full system audit</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperationsConsole;
