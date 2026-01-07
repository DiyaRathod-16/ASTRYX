import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { apiService } from '../services/apiService';

interface RiskMetric {
  region: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  activeThreats: number;
  change: number;
}

const GlobalRiskScoring: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([
    { region: 'North America', score: 67, trend: 'down', activeThreats: 12, change: -3 },
    { region: 'Europe', score: 54, trend: 'stable', activeThreats: 8, change: 0 },
    { region: 'Asia Pacific', score: 78, trend: 'up', activeThreats: 23, change: 5 },
    { region: 'Middle East', score: 82, trend: 'up', activeThreats: 31, change: 8 },
    { region: 'Africa', score: 61, trend: 'down', activeThreats: 15, change: -2 },
    { region: 'South America', score: 49, trend: 'stable', activeThreats: 7, change: 0 },
  ]);

  useEffect(() => {
    fetchRiskData();
    const interval = setInterval(fetchRiskData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchRiskData = async () => {
    try {
      const hotspots = await apiService.fetchHotspots();
      if (hotspots && hotspots.length > 0) {
        const regionMap: { [key: string]: { score: number; count: number } } = {};
        
        hotspots.forEach((hotspot: any) => {
          const region = getRegionFromCity(hotspot.name);
          if (!regionMap[region]) {
            regionMap[region] = { score: 0, count: 0 };
          }
          const riskScore = (hotspot.analysis?.consensus || 0.5) * 100;
          regionMap[region].score += riskScore;
          regionMap[region].count += 1;
        });

        const updatedMetrics = Object.keys(regionMap).map(region => {
          const avgScore = Math.round(regionMap[region].score / regionMap[region].count);
          const oldMetric = riskMetrics.find(m => m.region === region);
          const change = oldMetric ? avgScore - oldMetric.score : 0;
          
          return {
            region,
            score: avgScore,
            trend: change > 2 ? 'up' as const : change < -2 ? 'down' as const : 'stable' as const,
            activeThreats: regionMap[region].count,
            change
          };
        });

        if (updatedMetrics.length > 0) {
          setRiskMetrics(prev => {
            const updated = [...prev];
            updatedMetrics.forEach(newMetric => {
              const idx = updated.findIndex(m => m.region === newMetric.region);
              if (idx >= 0) {
                updated[idx] = newMetric;
              }
            });
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
    }
  };

  const getRegionFromCity = (city: string): string => {
    const regionMap: { [key: string]: string } = {
      'New York': 'North America',
      'London': 'Europe',
      'Tokyo': 'Asia Pacific',
      'Sydney': 'Asia Pacific',
      'Mumbai': 'Asia Pacific',
      'São Paulo': 'South America'
    };
    return regionMap[city] || 'Other';
  };

  const globalRiskScore = Math.round(riskMetrics.reduce((acc, m) => acc + m.score, 0) / riskMetrics.length);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-red-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3.5 h-3.5 text-red-400" />;
      case 'down': return <TrendingDown className="w-3.5 h-3.5 text-green-400" />;
      default: return <Minus className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Global Risk Scoring</h3>
        </div>
      </div>

      {/* Global Score */}
      <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-xl p-4 mb-5 border border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Global Risk Index</span>
          <span className="text-xs text-gray-500">Real-time</span>
        </div>
        <div className={`text-4xl font-bold mb-3 tabular-nums ${getRiskColor(globalRiskScore)}`}>
          {globalRiskScore}
          <span className="text-lg text-gray-500 ml-1">/100</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className={`bg-gradient-to-r ${getRiskBgColor(globalRiskScore)} h-2 rounded-full transition-all duration-700`}
            style={{ width: `${globalRiskScore}%` }}
          />
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {riskMetrics.slice(0, 4).map((metric) => (
          <div key={metric.region} className="bg-black/40 rounded-lg p-3 hover:bg-black/50 transition-all border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">{metric.region}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">{metric.activeThreats} threats</span>
                <span className={`text-base font-bold tabular-nums ${getRiskColor(metric.score)}`}>
                  {metric.score}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`bg-gradient-to-r ${getRiskBgColor(metric.score)} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <span className={`text-[10px] font-semibold w-6 text-right ${metric.change > 0 ? 'text-red-400' : metric.change < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Categories */}
      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-2">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-red-400 tabular-nums">2</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-orange-400 tabular-nums">4</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">High</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-yellow-400 tabular-nums">8</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Medium</div>
        </div>
      </div>
    </div>
  );
};

export default GlobalRiskScoring;
