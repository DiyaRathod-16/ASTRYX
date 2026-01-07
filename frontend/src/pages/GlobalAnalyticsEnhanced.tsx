import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Globe, Activity, Calendar,
  Download, Filter, RefreshCw, PieChart, LineChart
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GlobalRiskScoring from '../components/GlobalRiskScoring';
import PredictiveForecasting from '../components/PredictiveForecasting';
import InteractiveMapEnhanced from '../components/InteractiveMapEnhanced';

const GlobalAnalyticsEnhanced: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(false);

  const analyticsData = {
    totalAnomalies: 1247,
    avgResponseTime: '4.2m',
    swarmAccuracy: 97.8,
    regionsMonitored: 195,
    trendData: [
      { label: 'Mon', value: 45 },
      { label: 'Tue', value: 52 },
      { label: 'Wed', value: 48 },
      { label: 'Thu', value: 61 },
      { label: 'Fri', value: 55 },
      { label: 'Sat', value: 38 },
      { label: 'Sun', value: 42 }
    ],
    severityBreakdown: [
      { label: 'Critical', value: 12, color: 'bg-red-500' },
      { label: 'High', value: 28, color: 'bg-orange-500' },
      { label: 'Medium', value: 45, color: 'bg-yellow-500' },
      { label: 'Low', value: 15, color: 'bg-green-500' }
    ],
    topRegions: [
      { name: 'Asia Pacific', count: 342, change: +12 },
      { name: 'Europe', count: 287, change: -5 },
      { name: 'North America', count: 256, change: +8 },
      { name: 'Middle East', count: 198, change: +15 },
      { name: 'Africa', count: 164, change: +3 }
    ],
    sourceBreakdown: [
      { type: 'Sensor Data', count: 523, percent: 42 },
      { type: 'Image Analysis', count: 312, percent: 25 },
      { type: 'Text Mining', count: 249, percent: 20 },
      { type: 'Audio Detection', count: 163, percent: 13 }
    ]
  };

  const maxTrend = Math.max(...analyticsData.trendData.map(d => d.value));

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-0 lg:ml-64 px-3 lg:px-8 pt-[60px] lg:pt-8 pb-[72px] lg:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Global Analytics</h1>
            <p className="text-xs sm:text-sm text-gray-400">Comprehensive analytics and reporting dashboard</p>
          </div>
          <div className="flex items-center gap-2 lg:space-x-3">
            <div className="flex items-center space-x-1 bg-black/30 rounded-lg p-1">
              {(['24h', '7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs lg:text-sm transition-all ${
                    timeRange === range 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all text-xs lg:text-sm">
              <Download className="w-3 lg:w-4 h-3 lg:h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 lg:w-8 h-6 lg:h-8 text-cyan-400" />
              <span className="text-[10px] lg:text-xs text-green-400">+12%</span>
            </div>
            <div className="text-xl lg:text-3xl font-bold text-white">{analyticsData.totalAnomalies.toLocaleString()}</div>
            <div className="text-xs lg:text-sm text-gray-400">Total Anomalies</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 lg:w-8 h-6 lg:h-8 text-green-400" />
              <span className="text-[10px] lg:text-xs text-green-400">-8%</span>
            </div>
            <div className="text-xl lg:text-3xl font-bold text-white">{analyticsData.avgResponseTime}</div>
            <div className="text-xs lg:text-sm text-gray-400">Avg Response Time</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 lg:w-8 h-6 lg:h-8 text-purple-400" />
              <span className="text-[10px] lg:text-xs text-green-400">+2.1%</span>
            </div>
            <div className="text-xl lg:text-3xl font-bold text-white">{analyticsData.swarmAccuracy}%</div>
            <div className="text-xs lg:text-sm text-gray-400">Swarm Accuracy</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-6 lg:w-8 h-6 lg:h-8 text-orange-400" />
            </div>
            <div className="text-xl lg:text-3xl font-bold text-white">{analyticsData.regionsMonitored}</div>
            <div className="text-xs lg:text-sm text-gray-400">Regions Monitored</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="flex items-center space-x-2">
                <LineChart className="w-4 lg:w-5 h-4 lg:h-5 text-cyan-400" />
                <h3 className="text-base lg:text-lg font-semibold text-white">Anomaly Trend</h3>
              </div>
            </div>
            <div className="flex items-end justify-between h-48 px-2">
              {analyticsData.trendData.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-2 flex-1">
                  <div className="relative flex items-end h-36 w-full px-1">
                    <div 
                      className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${(day.value / maxTrend) * 100}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300">
                        {day.value}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center space-x-2 mb-4 lg:mb-6">
              <PieChart className="w-4 lg:w-5 h-4 lg:h-5 text-purple-400" />
              <h3 className="text-base lg:text-lg font-semibold text-white">Severity Distribution</h3>
            </div>
            <div className="space-y-4">
              {analyticsData.severityBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{item.label}</span>
                    <span className="text-sm text-gray-400">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map and Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="lg:col-span-2 h-[300px] lg:h-[400px]">
            <InteractiveMapEnhanced />
          </div>
          <GlobalRiskScoring />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Top Regions */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">Top Regions</h3>
            <div className="space-y-3">
              {analyticsData.topRegions.map((region, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500 text-sm">{idx + 1}</span>
                    <span className="text-white">{region.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">{region.count}</span>
                    <span className={`text-xs ${region.change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {region.change > 0 ? '+' : ''}{region.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">Data Sources</h3>
            <div className="space-y-4">
              {analyticsData.sourceBreakdown.map((source, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{source.type}</span>
                    <span className="text-sm text-gray-400">{source.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${source.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Forecasting */}
          <PredictiveForecasting />
        </div>
      </main>
    </div>
  );
};

export default GlobalAnalyticsEnhanced;
