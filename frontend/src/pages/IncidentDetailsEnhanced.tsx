import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, AlertTriangle, CheckCircle,
  XCircle, Share2, Download, Eye, Users, Activity,
  FileText, Image, Mic, Radio, TrendingUp, MessageSquare
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import InteractiveMapEnhanced from '../components/InteractiveMapEnhanced';
import { apiService } from '../services/apiService';
import { Anomaly } from '../types';

const IncidentDetailsEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'timeline' | 'mitigation'>('overview');

  useEffect(() => {
    if (id) {
      fetchAnomalyDetails();
    }
  }, [id]);

  const fetchAnomalyDetails = async () => {
    try {
      const data = await apiService.fetchAnomalyById(id!);
      setAnomaly(data);
    } catch (error) {
      console.error('Failed to fetch anomaly:', error);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      await apiService.approveAnomaly(id);
      fetchAnomalyDetails();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await apiService.rejectAnomaly(id);
      fetchAnomalyDetails();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const formatTime = (timestamp: string | Date | undefined) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading incident details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!anomaly) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Incident not found</p>
            <Link to="/incidents" className="text-cyan-400 hover:underline mt-2 inline-block">
              Back to Incidents
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const swarmAgents = anomaly.swarmConsensus?.agents || [
    { type: 'text', vote: 'verified', confidence: 0.91 },
    { type: 'image', vote: 'verified', confidence: 0.88 },
    { type: 'audio', vote: 'verified', confidence: 0.85 },
    { type: 'sensor', vote: 'pending', confidence: 0.72 },
    { type: 'verification', vote: 'verified', confidence: 0.94 },
    { type: 'forecasting', vote: 'verified', confidence: 0.89 }
  ];

  const timeline = [
    { time: '10:32:15', event: 'Anomaly detected by sensor agent', type: 'detection' },
    { time: '10:32:18', event: 'Image analysis initiated', type: 'analysis' },
    { time: '10:32:22', event: 'Text correlation completed', type: 'analysis' },
    { time: '10:32:25', event: 'Swarm consensus reached (87%)', type: 'consensus' },
    { time: '10:32:30', event: 'Alert generated and dispatched', type: 'alert' },
    { time: '10:35:00', event: 'Human review requested', type: 'review' }
  ];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  {anomaly.title || 'Anomaly Details'}
                </h1>
                <span className={`px-2 py-1 text-xs rounded border font-semibold ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity?.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-500">{anomaly.id}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
              <Download className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleApprove}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verify</span>
            </button>
            <button
              onClick={handleReject}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {['overview', 'analysis', 'timeline', 'mitigation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Description */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {anomaly.description || 'No description provided for this anomaly.'}
                  </p>
                </div>

                {/* Map */}
                <div className="h-[400px]">
                  <InteractiveMapEnhanced selectedAnomalyId={anomaly.id} />
                </div>

                {/* Data Sources */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { icon: FileText, label: 'Text', count: 3, color: 'text-blue-400' },
                      { icon: Image, label: 'Images', count: 2, color: 'text-purple-400' },
                      { icon: Mic, label: 'Audio', count: 1, color: 'text-green-400' },
                      { icon: Radio, label: 'Sensor', count: 5, color: 'text-cyan-400' }
                    ].map((source, idx) => (
                      <div key={idx} className="bg-black/30 rounded-lg p-4 text-center">
                        <source.icon className={`w-8 h-8 ${source.color} mx-auto mb-2`} />
                        <div className="text-sm text-white font-medium">{source.label}</div>
                        <div className="text-xs text-gray-500">{source.count} sources</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'analysis' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">AI Analysis Results</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-400 mb-2">Pattern Recognition</h4>
                    <p className="text-gray-400 text-sm">
                      Detected infrastructure disruption pattern consistent with supply chain anomalies 
                      observed in similar regions. Cross-modal verification confirms 87% match with 
                      historical incident profiles.
                    </p>
                  </div>
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2">Risk Assessment</h4>
                    <p className="text-gray-400 text-sm">
                      Elevated risk level based on geopolitical factors and recent regional activity. 
                      Recommend immediate monitoring and stakeholder notification.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-400 mb-2">Predicted Impact</h4>
                    <p className="text-gray-400 text-sm">
                      Potential for cascade effect across connected infrastructure nodes. 
                      Estimated impact radius: 150km. Affected population: ~2.3M.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Event Timeline</h3>
                <div className="space-y-4">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                      <div className="text-sm text-gray-500 w-20">{event.time}</div>
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${
                        event.type === 'consensus' ? 'bg-green-400' :
                        event.type === 'alert' ? 'bg-orange-400' :
                        event.type === 'review' ? 'bg-purple-400' :
                        'bg-cyan-400'
                      }`} />
                      <div className="flex-1 text-sm text-white">{event.event}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mitigation' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Mitigation Steps</h3>
                <div className="space-y-3">
                  {[
                    { step: 'Isolate affected systems', status: 'completed' },
                    { step: 'Deploy backup resources', status: 'completed' },
                    { step: 'Notify stakeholders', status: 'in-progress' },
                    { step: 'Root cause analysis', status: 'pending' },
                    { step: 'Implement permanent fix', status: 'pending' }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${
                      item.status === 'completed' ? 'bg-green-500/10' :
                      item.status === 'in-progress' ? 'bg-yellow-500/10' :
                      'bg-black/30'
                    }`}>
                      <div className="flex items-center space-x-3">
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : item.status === 'in-progress' ? (
                          <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                        )}
                        <span className={`text-sm ${item.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {idx + 1}. {item.step}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="text-white">{anomaly.location?.name || 'Unknown'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Detected</div>
                    <div className="text-white">{formatTime(anomaly.timestamp || anomaly.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Status</div>
                    <div className="text-white capitalize">{anomaly.status || 'pending'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Swarm Consensus */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Swarm Consensus</h3>
              </div>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-green-400 mb-1">
                  {Math.round((anomaly.swarmConsensus?.score || 0.87) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Overall Consensus</div>
              </div>
              <div className="space-y-2">
                {swarmAgents.map((agent: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-black/30 rounded">
                    <span className="text-sm text-white capitalize">{agent.type}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${
                        agent.vote === 'verified' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {Math.round(agent.confidence * 100)}%
                      </span>
                      {agent.vote === 'verified' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all">
                  <TrendingUp className="w-4 h-4" />
                  <span>Run Re-analysis</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all">
                  <MessageSquare className="w-4 h-4" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncidentDetailsEnhanced;
