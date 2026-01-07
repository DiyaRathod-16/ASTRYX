import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, RefreshCw, AlertTriangle, 
  MapPin, Clock, ChevronRight, Eye, 
  CheckCircle, XCircle, TrendingUp
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { apiService } from '../services/apiService';
import { Anomaly } from '../types';

const IncidentsListPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchAnomalies();
      setAnomalies(data);
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const formatTime = (timestamp: string | Date | undefined) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const filteredAnomalies = anomalies
    .filter(a => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          a.title?.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.location?.name?.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(a => severityFilter === 'all' || a.severity === severityFilter)
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'severity') {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (severityOrder[a.severity as keyof typeof severityOrder] || 4) - 
               (severityOrder[b.severity as keyof typeof severityOrder] || 4);
      }
      return 0;
    });

  const stats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    pending: anomalies.filter(a => a.status === 'pending').length
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 ml-0 lg:ml-64 px-3 lg:px-8 pt-[60px] lg:pt-8 pb-[72px] lg:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Incidents</h1>
            <p className="text-gray-400">Manage and investigate anomaly incidents</p>
          </div>
          <button
            onClick={fetchAnomalies}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Incidents</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-400">{stats.high}</div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending Review</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 text-white pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">By Severity</option>
            </select>
          </div>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading incidents...</p>
            </div>
          ) : filteredAnomalies.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No incidents found</p>
            </div>
          ) : (
            filteredAnomalies.map((anomaly) => (
              <Link
                key={anomaly.id}
                to={`/incident/${anomaly.id}`}
                className="block bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs rounded border font-semibold ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(anomaly.status || 'pending')}`}>
                        {anomaly.status || 'pending'}
                      </span>
                      <span className="text-sm text-gray-500">{anomaly.id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {anomaly.title || 'Anomaly Detected'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {anomaly.description || 'No description available'}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{anomaly.location?.name || 'Unknown Location'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(anomaly.timestamp || anomaly.createdAt)}</span>
                      </div>
                      {anomaly.swarmConsensus && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">
                            {Math.round((typeof anomaly.swarmConsensus === 'object' ? anomaly.swarmConsensus.score : anomaly.swarmConsensus || 0.85) * 100)}% consensus
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-black/30 rounded-lg hover:bg-green-500/20 transition-all">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </button>
                    <button className="p-2 bg-black/30 rounded-lg hover:bg-red-500/20 transition-all">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default IncidentsListPage;
