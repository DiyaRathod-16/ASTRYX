import React, { useState, useEffect } from 'react';
import { Brain, Eye, Mic, Activity, Network, TrendingUp } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Agent {
  id: string;
  type: 'text' | 'image' | 'audio' | 'sensor' | 'verification' | 'forecasting';
  status: 'active' | 'processing' | 'idle' | 'error';
  confidence: number;
  output?: string;
}

interface SwarmVisualizationProps {
  anomalyId?: string;
  showDetails?: boolean;
  realData?: boolean;
}

const SwarmVisualization: React.FC<SwarmVisualizationProps> = ({ 
  anomalyId, 
  showDetails = false, 
  realData = true 
}) => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'text-001', type: 'text', status: 'active', confidence: 0.92, output: 'Anomalous pattern detected in text data' },
    { id: 'text-002', type: 'text', status: 'processing', confidence: 0.87 },
    { id: 'img-001', type: 'image', status: 'active', confidence: 0.89, output: 'Visual anomaly confirmed' },
    { id: 'img-002', type: 'image', status: 'active', confidence: 0.91 },
    { id: 'audio-001', type: 'audio', status: 'processing', confidence: 0.78 },
    { id: 'sensor-001', type: 'sensor', status: 'active', confidence: 0.85 },
    { id: 'verify-001', type: 'verification', status: 'active', confidence: 0.94, output: 'Cross-modal verification passed' },
    { id: 'forecast-001', type: 'forecasting', status: 'processing', confidence: 0.82 }
  ]);

  const [consensusScore, setConsensusScore] = useState(0.89);

  useEffect(() => {
    if (realData) {
      fetchAgentData();
      const interval = setInterval(fetchAgentData, 30000);
      return () => clearInterval(interval);
    }
  }, [anomalyId, realData]);

  const fetchAgentData = async () => {
    try {
      const stats = await apiService.fetchAgentStats();
      if (stats) {
        setConsensusScore(stats.consensusScore || 0.89);
      }
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'text': return Brain;
      case 'image': return Eye;
      case 'audio': return Mic;
      case 'sensor': return Activity;
      case 'verification': return Network;
      case 'forecasting': return TrendingUp;
      default: return Brain;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 shadow-green-500/50';
      case 'processing': return 'bg-cyan-500 animate-pulse shadow-cyan-500/50';
      case 'idle': return 'bg-gray-500';
      case 'error': return 'bg-red-500 shadow-red-500/50';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'text-blue-400 bg-blue-500/10';
      case 'image': return 'text-purple-400 bg-purple-500/10';
      case 'audio': return 'text-pink-400 bg-pink-500/10';
      case 'sensor': return 'text-green-400 bg-green-500/10';
      case 'verification': return 'text-yellow-400 bg-yellow-500/10';
      case 'forecasting': return 'text-cyan-400 bg-cyan-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const agentsByType = agents.reduce((acc, agent) => {
    if (!acc[agent.type]) acc[agent.type] = [];
    acc[agent.type].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  const activeCount = agents.filter(a => a.status === 'active').length;
  const processingCount = agents.filter(a => a.status === 'processing').length;

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Network className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Agent Swarm Activity</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>{activeCount + processingCount} active</span>
        </div>
      </div>

      {/* Consensus Score */}
      <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-xl p-4 mb-5 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Swarm Consensus</span>
          <span className="text-2xl font-bold text-white tabular-nums">{(consensusScore * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${consensusScore * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
          <span>{activeCount} active • {processingCount} processing</span>
          <span>Target: 85%</span>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-4 gap-2.5 flex-1">
        {agents.map((agent) => {
          const Icon = getAgentIcon(agent.type);
          return (
            <div 
              key={agent.id}
              className="bg-black/40 rounded-lg p-2.5 border border-white/5 hover:border-white/20 hover:bg-black/50 transition-all duration-200 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${getTypeColor(agent.type).split(' ')[1]}`}>
                  <Icon className={`w-3.5 h-3.5 ${getTypeColor(agent.type).split(' ')[0]}`} />
                </div>
                <div className={`w-2 h-2 rounded-full shadow-lg ${getStatusColor(agent.status)}`} />
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{agent.type}</div>
              <div className="text-sm font-bold text-white">{(agent.confidence * 100).toFixed(0)}%</div>
              {showDetails && agent.output && (
                <p className="text-[10px] text-gray-500 mt-1.5 line-clamp-2 leading-tight">{agent.output}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent Type Summary */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(agentsByType).map(([type, typeAgents]) => (
            <span 
              key={type}
              className={`text-[10px] px-2 py-1 rounded-md font-medium ${getTypeColor(type)}`}
            >
              {typeAgents.length} {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwarmVisualization;
