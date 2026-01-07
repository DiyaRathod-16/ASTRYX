import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAnomalyStore } from '../stores';
import StatsCards from '../components/StatsCards';
import AnomalyCard from '../components/AnomalyCard';
import AnomalyMap, { SeverityLegend } from '../components/AnomalyMap';

export default function Dashboard() {
  const { anomalies, stats, loading, fetchAnomalies, fetchStats } = useAnomalyStore();
  const [filter, setFilter] = useState({ severity: '', type: '', status: '' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnomalies({ limit: 50 });
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnomalies({ limit: 50 });
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnomalies, fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAnomalies({ limit: 50 }), fetchStats()]);
    setRefreshing(false);
  };

  const filteredAnomalies = anomalies.filter((a) => {
    if (filter.severity && a.severity !== filter.severity) return false;
    if (filter.type && a.type !== filter.type) return false;
    if (filter.status && a.status !== filter.status) return false;
    return true;
  });

  const recentCritical = anomalies.filter((a) => a.severity === 'critical').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Real-time anomaly monitoring and detection</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} loading={loading} />

      {/* Critical Alerts Banner */}
      {recentCritical.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Critical Alerts ({recentCritical.length})
          </h3>
          <div className="grid gap-2">
            {recentCritical.map((anomaly) => (
              <AnomalyCard key={anomaly.id} anomaly={anomaly} compact />
            ))}
          </div>
        </div>
      )}

      {/* Map and Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2 bg-gray-800 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Global Anomaly Map</h2>
            <Link
              to="/map"
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Full screen →
            </Link>
          </div>
          <SeverityLegend />
          <div className="mt-4">
            <AnomalyMap anomalies={filteredAnomalies} height="400px" />
          </div>
        </div>

        {/* Recent Feed */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Anomalies</h2>
            <span className="text-sm text-gray-400">{filteredAnomalies.length} total</span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              className="text-sm bg-gray-700 border-gray-600 rounded px-2 py-1 text-white"
            >
              <option value="">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="text-sm bg-gray-700 border-gray-600 rounded px-2 py-1 text-white"
            >
              <option value="">All Status</option>
              <option value="detected">Detected</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Anomaly List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-600 rounded w-1/2" />
                </div>
              ))
            ) : filteredAnomalies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No anomalies found
              </div>
            ) : (
              filteredAnomalies.slice(0, 20).map((anomaly) => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} compact />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
