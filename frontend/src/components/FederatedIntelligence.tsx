import React, { useState, useEffect } from 'react';
import { Globe, Share2, Database, Lock, ArrowRight, CheckCircle } from 'lucide-react';

interface IntelNode {
  id: string;
  name: string;
  region: string;
  status: 'online' | 'syncing' | 'offline';
  dataShared: number;
  lastSync: string;
  contributions: number;
}

interface SharedIntel {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  verified: boolean;
}

const FederatedIntelligence: React.FC = () => {
  const [nodes] = useState<IntelNode[]>([
    { id: 'node-1', name: 'ASTRYX-NA', region: 'North America', status: 'online', dataShared: 1247, lastSync: '2m ago', contributions: 342 },
    { id: 'node-2', name: 'ASTRYX-EU', region: 'Europe', status: 'online', dataShared: 982, lastSync: '1m ago', contributions: 278 },
    { id: 'node-3', name: 'ASTRYX-APAC', region: 'Asia Pacific', status: 'syncing', dataShared: 1523, lastSync: '5m ago', contributions: 456 },
    { id: 'node-4', name: 'ASTRYX-ME', region: 'Middle East', status: 'online', dataShared: 634, lastSync: '3m ago', contributions: 189 },
    { id: 'node-5', name: 'ASTRYX-AF', region: 'Africa', status: 'offline', dataShared: 412, lastSync: '15m ago', contributions: 98 },
  ]);

  const [recentIntel] = useState<SharedIntel[]>([
    { id: 'int-1', type: 'Threat Pattern', source: 'ASTRYX-EU', timestamp: '2m ago', verified: true },
    { id: 'int-2', type: 'Anomaly Signature', source: 'ASTRYX-APAC', timestamp: '5m ago', verified: true },
    { id: 'int-3', type: 'Risk Indicator', source: 'ASTRYX-NA', timestamp: '8m ago', verified: false },
    { id: 'int-4', type: 'Correlation Rule', source: 'ASTRYX-ME', timestamp: '12m ago', verified: true },
  ]);

  const [networkHealth, setNetworkHealth] = useState(94);

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkHealth(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(85, Math.min(99, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'syncing': return 'bg-yellow-400 animate-pulse';
      default: return 'bg-red-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'syncing': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const totalDataShared = nodes.reduce((acc, n) => acc + n.dataShared, 0);
  const onlineNodes = nodes.filter(n => n.status !== 'offline').length;

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Share2 className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-semibold text-white">Federated Intelligence</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">{onlineNodes}/{nodes.length} nodes active</span>
        </div>
      </div>

      {/* Network Health Bar */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Network Health</span>
          <span className="text-lg font-bold text-green-400">{networkHealth}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${networkHealth}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span><Database className="w-3 h-3 inline mr-1" />{totalDataShared.toLocaleString()} intel shared</span>
          <span><Lock className="w-3 h-3 inline mr-1" />End-to-end encrypted</span>
        </div>
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {nodes.slice(0, 4).map((node) => (
          <div key={node.id} className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
                <span className="text-sm font-medium text-white">{node.name}</span>
              </div>
              <span className={`text-xs ${getStatusText(node.status)}`}>{node.status}</span>
            </div>
            <div className="text-xs text-gray-500">{node.region}</div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-gray-400">{node.dataShared} shared</span>
              <span className="text-gray-500">{node.lastSync}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Intel Feed */}
      <div className="bg-black/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Recent Intel</span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          {recentIntel.map((intel) => (
            <div key={intel.id} className="flex items-center justify-between p-2 bg-black/30 rounded">
              <div className="flex items-center space-x-2">
                {intel.verified && <CheckCircle className="w-3 h-3 text-green-400" />}
                <span className="text-sm text-white">{intel.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-indigo-400">{intel.source}</span>
                <span className="text-xs text-gray-500">{intel.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-indigo-400">{nodes.length}</div>
          <div className="text-xs text-gray-400">Total Nodes</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-cyan-400">1.3K</div>
          <div className="text-xs text-gray-400">Contributions</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-400">47ms</div>
          <div className="text-xs text-gray-400">Avg Latency</div>
        </div>
      </div>
    </div>
  );
};

export default FederatedIntelligence;
