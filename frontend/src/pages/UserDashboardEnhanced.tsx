import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, AlertTriangle, Shield, Clock, 
  TrendingUp, Zap, Eye, Radio, ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import SwarmVisualization from '../components/SwarmVisualization';
import GlobalRiskScoring from '../components/GlobalRiskScoring';
import PredictiveForecasting from '../components/PredictiveForecasting';
import InteractiveMapEnhanced from '../components/InteractiveMapEnhanced';
import { apiService } from '../services/apiService';
import { Anomaly } from '../types';

interface DashboardStats {
  totalAnomalies: number;
  activeIncidents: number;
  resolvedToday: number;
  avgResponseTime: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

const UserDashboardEnhanced: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnomalies: 0,
    activeIncidents: 0,
    resolvedToday: 0,
    avgResponseTime: '0m',
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0
  });
  const [recentAnomalies, setRecentAnomalies] = useState<Anomaly[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [anomaliesData, statsData] = await Promise.all([
        apiService.fetchAnomalies(),
        apiService.fetchDashboardStats()
      ]);

      setRecentAnomalies(anomaliesData.slice(0, 10));
      
      const critical = anomaliesData.filter((a: Anomaly) => a.severity === 'critical').length;
      const high = anomaliesData.filter((a: Anomaly) => a.severity === 'high').length;
      const medium = anomaliesData.filter((a: Anomaly) => a.severity === 'medium').length;
      const low = anomaliesData.filter((a: Anomaly) => a.severity === 'low').length;

      setStats({
        totalAnomalies: anomaliesData.length,
        activeIncidents: statsData.activeIncidents || critical + high,
        resolvedToday: statsData.resolvedToday || 12,
        avgResponseTime: statsData.avgResponseTime || '4.2m',
        criticalCount: critical,
        highCount: high,
        mediumCount: medium,
        lowCount: low
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
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
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      
      <main className="ml-0 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Command Dashboard</h1>
            <p className="text-sm text-gray-400">Real-time global anomaly monitoring & response</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-300 font-mono tabular-nums">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Radio className="w-3 h-3 text-green-400 animate-pulse" />
              <span className="text-sm text-green-400 font-medium">Live</span>
            </div>
          </div>
        </header>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: Activity, label: 'Total Anomalies', value: stats.totalAnomalies, color: 'cyan', change: '+12%' },
            { icon: AlertTriangle, label: 'Active Incidents', value: stats.activeIncidents, color: 'orange', change: 'Active' },
            { icon: Shield, label: 'Resolved Today', value: stats.resolvedToday, color: 'green', change: 'Today' },
            { icon: Zap, label: 'Response Time', value: stats.avgResponseTime, color: 'purple', change: 'Avg' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded text-${stat.color}-400 bg-${stat.color}-500/10`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white tabular-nums mb-0.5">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Severity Breakdown */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Critical', count: stats.criticalCount, color: 'red', icon: AlertTriangle },
            { label: 'High', count: stats.highCount, color: 'orange', icon: TrendingUp },
            { label: 'Medium', count: stats.mediumCount, color: 'yellow', icon: Eye },
            { label: 'Low', count: stats.lowCount, color: 'green', icon: Shield }
          ].map((item, idx) => (
            <div key={idx} className={`bg-${item.color}-500/10 border border-${item.color}-500/20 rounded-lg p-3 flex items-center justify-between`}>
              <div>
                <div className={`text-xl font-bold text-${item.color}-400 tabular-nums`}>{item.count}</div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </div>
              <div className={`w-8 h-8 bg-${item.color}-500/20 rounded-lg flex items-center justify-center`}>
                <item.icon className={`w-4 h-4 text-${item.color}-400`} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid - Map + Swarm */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-8 h-[420px]">
            <InteractiveMapEnhanced 
              onAnomalySelect={setSelectedAnomaly}
              selectedAnomalyId={selectedAnomaly?.id}
            />
          </div>
          <div className="col-span-4 h-[420px]">
            <SwarmVisualization />
          </div>
        </div>

        {/* Bottom Row - 3 Column Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Recent Anomalies */}
          <div className="col-span-4 bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recent Anomalies</h3>
              <Link to="/incidents" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {recentAnomalies.slice(0, 5).map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="p-3 bg-black/40 rounded-lg hover:bg-black/60 transition-all cursor-pointer border border-transparent hover:border-white/10"
                  onClick={() => setSelectedAnomaly(anomaly)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-1.5 py-0.5 text-[10px] rounded border font-medium uppercase ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatTime(anomaly.timestamp || anomaly.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium truncate mb-0.5">
                    {anomaly.title || 'Anomaly Detected'}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {anomaly.location?.name || 'Unknown Location'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Risk Scoring */}
          <div className="col-span-4">
            <GlobalRiskScoring />
          </div>

          {/* Predictive Forecasting */}
          <div className="col-span-4">
            <PredictiveForecasting />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboardEnhanced;
