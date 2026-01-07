import React, { useState } from 'react';
import { Activity, AlertCircle, TrendingUp, Calendar } from 'lucide-react';

interface PredictionData {
  region: string;
  predictedScore: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface ForecastTrend {
  day: string;
  value: number;
}

const PredictiveForecasting: React.FC = () => {
  const [predictions] = useState<PredictionData[]>([
    {
      region: 'Asia Pacific',
      predictedScore: 85,
      confidence: 89,
      timeframe: '24h',
      factors: ['Political unrest patterns', 'Economic indicators', 'Social media sentiment']
    },
    {
      region: 'Middle East',
      predictedScore: 78,
      confidence: 76,
      timeframe: '48h',
      factors: ['Conflict zone activity', 'Resource scarcity signals', 'Migration patterns']
    },
    {
      region: 'Europe',
      predictedScore: 45,
      confidence: 92,
      timeframe: '72h',
      factors: ['Energy grid stability', 'Supply chain disruptions', 'Climate events']
    }
  ]);

  const [forecastTrend] = useState<ForecastTrend[]>([
    { day: 'Mon', value: 54 },
    { day: 'Tue', value: 58 },
    { day: 'Wed', value: 62 },
    { day: 'Thu', value: 67 },
    { day: 'Fri', value: 71 },
    { day: 'Sat', value: 68 },
    { day: 'Sun', value: 64 }
  ]);

  const [activeTab, setActiveTab] = useState<'regional' | 'timeline'>('regional');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const maxValue = Math.max(...forecastTrend.map(t => t.value));

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Predictive Forecasting</h3>
        </div>
        <div className="flex gap-1 bg-black/30 p-0.5 rounded-lg">
          <button
            onClick={() => setActiveTab('regional')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'regional' 
                ? 'bg-purple-500/30 text-purple-400' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Regional
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'timeline' 
                ? 'bg-purple-500/30 text-purple-400' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {activeTab === 'regional' ? (
        <div className="flex-1 space-y-2.5 overflow-y-auto">
          {predictions.map((prediction, idx) => (
            <div key={idx} className="bg-black/40 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{prediction.region}</span>
                  <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded font-medium">
                    {prediction.timeframe}
                  </span>
                </div>
                <div className={`text-base font-bold tabular-nums ${getScoreColor(prediction.predictedScore)}`}>
                  {prediction.predictedScore}
                </div>
              </div>

              <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
                <div 
                  className={`${getBarColor(prediction.predictedScore)} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${prediction.predictedScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {prediction.factors.slice(0, 1).map((factor, fidx) => (
                    <span key={fidx} className="px-1.5 py-0.5 bg-gray-800 text-gray-500 text-[9px] rounded">
                      {factor}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400">{prediction.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-3">
          {/* 7-Day Forecast Chart */}
          <div className="flex-1 bg-black/40 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-3">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] text-gray-400 font-medium">7-Day Risk Forecast</span>
            </div>
            
            <div className="flex items-end justify-between h-24 px-1">
              {forecastTrend.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="relative flex items-end h-16 w-full px-0.5">
                    <div 
                      className={`w-full ${getBarColor(day.value)} rounded-sm transition-all duration-500`}
                      style={{ height: `${(day.value / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/40 rounded-lg p-2 text-center">
              <div className="text-[10px] text-gray-500 mb-0.5">Peak Day</div>
              <div className="text-sm font-bold text-orange-400">Friday</div>
            </div>
            <div className="bg-black/40 rounded-lg p-2 text-center">
              <div className="text-[10px] text-gray-500 mb-0.5">Avg Score</div>
              <div className="text-sm font-bold text-yellow-400 tabular-nums">63</div>
            </div>
            <div className="bg-black/40 rounded-lg p-2 text-center">
              <div className="text-[10px] text-gray-500 mb-0.5">Trend</div>
              <div className="text-sm font-bold text-red-400">↑ Rising</div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] text-white font-medium mb-0.5">ASTRYX AI Insight</div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Expect elevated risk mid-week due to converging geopolitical events. 
                  Recommend increased monitoring for Asia Pacific.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveForecasting;
