import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, Download, Calendar,
  User, Activity, Shield, AlertTriangle, Eye,
  Clock, ChevronRight, RefreshCw
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-001',
      timestamp: '2026-01-06 10:32:15',
      user: 'admin@astryx.io',
      action: 'ANOMALY_VERIFIED',
      resource: 'ANM-001',
      details: 'Verified infrastructure anomaly in Tokyo region',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: 'log-002',
      timestamp: '2026-01-06 10:28:42',
      user: 'analyst@astryx.io',
      action: 'DATA_UPLOAD',
      resource: 'Upload Queue',
      details: 'Uploaded 3 sensor data files for analysis',
      ipAddress: '192.168.1.105',
      status: 'success'
    },
    {
      id: 'log-003',
      timestamp: '2026-01-06 10:15:33',
      user: 'system',
      action: 'SWARM_CONSENSUS',
      resource: 'ANM-002',
      details: 'Swarm reached 87% consensus on Mumbai anomaly',
      ipAddress: 'internal',
      status: 'success'
    },
    {
      id: 'log-004',
      timestamp: '2026-01-06 09:58:21',
      user: 'admin@astryx.io',
      action: 'SETTINGS_UPDATE',
      resource: 'System Settings',
      details: 'Updated notification preferences',
      ipAddress: '192.168.1.100',
      status: 'warning'
    },
    {
      id: 'log-005',
      timestamp: '2026-01-06 09:45:12',
      user: 'system',
      action: 'ALERT_DISPATCH',
      resource: 'Alert System',
      details: 'Dispatched critical alert to 5 channels',
      ipAddress: 'internal',
      status: 'success'
    },
    {
      id: 'log-006',
      timestamp: '2026-01-06 09:30:05',
      user: 'analyst@astryx.io',
      action: 'ANOMALY_REJECTED',
      resource: 'ANM-005',
      details: 'Rejected false positive detection',
      ipAddress: '192.168.1.105',
      status: 'warning'
    },
    {
      id: 'log-007',
      timestamp: '2026-01-06 09:15:00',
      user: 'system',
      action: 'BACKUP_COMPLETE',
      resource: 'Database',
      details: 'Daily backup completed successfully',
      ipAddress: 'internal',
      status: 'success'
    },
    {
      id: 'log-008',
      timestamp: '2026-01-06 08:45:33',
      user: 'admin@astryx.io',
      action: 'LOGIN',
      resource: 'Auth System',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.100',
      status: 'success'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  const getActionIcon = (action: string) => {
    if (action.includes('VERIFIED') || action.includes('APPROVED')) return <Shield className="w-4 h-4 text-green-400" />;
    if (action.includes('REJECTED')) return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    if (action.includes('UPLOAD')) return <Activity className="w-4 h-4 text-cyan-400" />;
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return <User className="w-4 h-4 text-purple-400" />;
    if (action.includes('ALERT')) return <AlertTriangle className="w-4 h-4 text-red-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredLogs = logs
    .filter(log => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(query) ||
          log.user.toLowerCase().includes(query) ||
          log.resource.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(log => actionFilter === 'all' || log.action.includes(actionFilter))
    .filter(log => statusFilter === 'all' || log.status === statusFilter);

  const actionTypes = ['all', 'VERIFIED', 'REJECTED', 'UPLOAD', 'LOGIN', 'ALERT', 'SETTINGS'];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
            <p className="text-gray-400">Track all system activities and user actions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-black/30 text-gray-400 rounded-lg hover:bg-black/50 transition-all">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">{logs.length}</div>
            <div className="text-sm text-gray-400">Total Events</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {logs.filter(l => l.status === 'success').length}
            </div>
            <div className="text-sm text-gray-400">Successful</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {logs.filter(l => l.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-400">Warnings</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">
              {logs.filter(l => l.status === 'error').length}
            </div>
            <div className="text-sm text-gray-400">Errors</div>
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
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 text-white pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10"
            >
              {actionTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Actions' : type}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Timestamp</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">User</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Action</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Resource</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Details</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-white">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm text-white font-mono">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-cyan-400">{log.resource}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400 truncate block max-w-[300px]">{log.details}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing {filteredLogs.length} of {logs.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-black/30 text-gray-400 rounded-lg hover:bg-black/50">Previous</button>
            <button className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg">1</button>
            <button className="px-3 py-1 bg-black/30 text-gray-400 rounded-lg hover:bg-black/50">2</button>
            <button className="px-3 py-1 bg-black/30 text-gray-400 rounded-lg hover:bg-black/50">3</button>
            <button className="px-3 py-1 bg-black/30 text-gray-400 rounded-lg hover:bg-black/50">Next</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditLogsPage;
