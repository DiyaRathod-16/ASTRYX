import { useEffect, useState } from 'react';
import { useAnomalyStore, Anomaly } from '../stores';
import AnomalyMap, { SeverityLegend } from '../components/AnomalyMap';
import AnomalyCard from '../components/AnomalyCard';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function MapView() {
  const { anomalies, fetchAnomalies, loading } = useAnomalyStore();
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [filter, setFilter] = useState({ severity: '', type: '' });

  useEffect(() => {
    fetchAnomalies({ limit: 100 });
  }, [fetchAnomalies]);

  const filteredAnomalies = anomalies.filter((a) => {
    if (filter.severity && a.severity !== filter.severity) return false;
    if (filter.type && a.type !== filter.type) return false;
    return true;
  });

  const anomalyTypes = [...new Set(anomalies.map((a) => a.type))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Global Anomaly Map</h1>
          <p className="text-gray-400">
            Visualizing {filteredAnomalies.length} anomalies worldwide
          </p>
        </div>
        <SeverityLegend />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-3 border border-gray-700/50">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        <select
          value={filter.severity}
          onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
          className="bg-gray-700 border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="">All Severity Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="bg-gray-700 border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="">All Types</option>
          {anomalyTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        {(filter.severity || filter.type) && (
          <button
            onClick={() => setFilter({ severity: '', type: '' })}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Map */}
      <div className="relative">
        <AnomalyMap
          anomalies={filteredAnomalies}
          height="calc(100vh - 280px)"
          onAnomalyClick={setSelectedAnomaly}
        />

        {/* Selected Anomaly Panel */}
        {selectedAnomaly && (
          <div className="absolute top-4 right-4 w-80 bg-gray-800/95 backdrop-blur rounded-xl border border-gray-700 shadow-xl z-10">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white">Anomaly Details</h3>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <AnomalyCard anomaly={selectedAnomaly} />
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-xl">
            <div className="text-white flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading anomalies...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
