import React, { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, Eye, Users,
  FileText, Image, Mic, Radio, TrendingUp,
  AlertTriangle, ChevronRight, Filter, Search
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { apiService } from '../services/apiService';

interface VerificationItem {
  id: string;
  anomalyId: string;
  title: string;
  severity: string;
  swarmConsensus: number;
  agentVotes: { type: string; vote: string; confidence: number }[];
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  dataSources: string[];
}

const VerificationPage: React.FC = () => {
  const [items, setItems] = useState<VerificationItem[]>([
    {
      id: 'ver-001',
      anomalyId: 'ANM-001',
      title: 'Infrastructure Disruption - Tokyo',
      severity: 'critical',
      swarmConsensus: 94,
      agentVotes: [
        { type: 'text', vote: 'verified', confidence: 92 },
        { type: 'image', vote: 'verified', confidence: 89 },
        { type: 'sensor', vote: 'verified', confidence: 96 },
        { type: 'forecasting', vote: 'verified', confidence: 91 }
      ],
      submittedAt: '10 minutes ago',
      status: 'pending',
      dataSources: ['text', 'image', 'sensor']
    },
    {
      id: 'ver-002',
      anomalyId: 'ANM-002',
      title: 'Supply Chain Alert - Mumbai',
      severity: 'high',
      swarmConsensus: 87,
      agentVotes: [
        { type: 'text', vote: 'verified', confidence: 85 },
        { type: 'image', vote: 'pending', confidence: 72 },
        { type: 'sensor', vote: 'verified', confidence: 91 }
      ],
      submittedAt: '25 minutes ago',
      status: 'pending',
      dataSources: ['text', 'sensor']
    },
    {
      id: 'ver-003',
      anomalyId: 'ANM-003',
      title: 'Climate Event - São Paulo',
      severity: 'medium',
      swarmConsensus: 78,
      agentVotes: [
        { type: 'text', vote: 'verified', confidence: 81 },
        { type: 'image', vote: 'verified', confidence: 76 }
      ],
      submittedAt: '1 hour ago',
      status: 'verified',
      dataSources: ['text', 'image']
    }
  ]);

  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const handleVerify = async (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'verified' as const } : item
    ));
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, status: 'verified' } : null);
    }
  };

  const handleReject = async (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'rejected' as const } : item
    ));
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, status: 'rejected' } : null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'text': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'image': return <Image className="w-4 h-4 text-purple-400" />;
      case 'audio': return <Mic className="w-4 h-4 text-green-400" />;
      case 'sensor': return <Radio className="w-4 h-4 text-cyan-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConsensusColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.status === filter);

  const pendingCount = items.filter(i => i.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-0 lg:ml-64 px-3 lg:px-8 pt-[60px] lg:pt-8 pb-[72px] lg:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Verification Queue</h1>
            <p className="text-xs sm:text-sm text-gray-400">Human-in-the-loop verification for AI-detected anomalies</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-3 lg:px-4 py-1.5 lg:py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
              <span className="font-bold">{pendingCount}</span> pending review
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Queue List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                {['all', 'pending', 'verified', 'rejected'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      filter === f 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-black/30 backdrop-blur-sm rounded-xl p-5 border transition-all cursor-pointer ${
                    selectedItem?.id === item.id 
                      ? 'border-cyan-500' 
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs rounded border font-semibold ${getSeverityColor(item.severity)}`}>
                          {item.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          item.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-500">{item.anomalyId}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-semibold ${getConsensusColor(item.swarmConsensus)}`}>
                            {item.swarmConsensus}% consensus
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{item.submittedAt}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {item.dataSources.map((source, idx) => (
                            <span key={idx}>{getSourceIcon(source)}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {item.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleVerify(item.id); }}
                          className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-all"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReject(item.id); }}
                          className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-all"
                        >
                          <XCircle className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div>
            {selectedItem ? (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Verification Details</h3>
                
                {/* Consensus Score */}
                <div className="text-center mb-6">
                  <div className={`text-5xl font-bold mb-2 ${getConsensusColor(selectedItem.swarmConsensus)}`}>
                    {selectedItem.swarmConsensus}%
                  </div>
                  <div className="text-sm text-gray-400">Swarm Consensus</div>
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedItem.swarmConsensus >= 90 ? 'bg-green-500' :
                        selectedItem.swarmConsensus >= 75 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${selectedItem.swarmConsensus}%` }}
                    />
                  </div>
                </div>

                {/* Agent Votes */}
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-3">Agent Votes</div>
                  <div className="space-y-2">
                    {selectedItem.agentVotes.map((vote, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getSourceIcon(vote.type)}
                          <span className="text-sm text-white capitalize">{vote.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{vote.confidence}%</span>
                          {vote.vote === 'verified' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {selectedItem.status === 'pending' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleVerify(selectedItem.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Verify Anomaly</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedItem.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject Anomaly</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all">
                      <Eye className="w-5 h-5" />
                      <span>Request More Data</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select an item to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerificationPage;
