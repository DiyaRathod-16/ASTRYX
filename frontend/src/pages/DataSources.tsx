import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { dataSourceApi } from '../services/api';

interface DataSource {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  refreshInterval: number;
  lastFetchAt: string | null;
  fetchCount: number;
  errorCount: number;
}

export default function DataSources() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSources();
    fetchStats();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await dataSourceApi.getAll();
      setSources(response.data.data);
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dataSourceApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await dataSourceApi.activate(id);
      toast.success('Data source activated');
      fetchSources();
    } catch (error) {
      toast.error('Failed to activate data source');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await dataSourceApi.deactivate(id);
      toast.success('Data source deactivated');
      fetchSources();
    } catch (error) {
      toast.error('Failed to deactivate data source');
    }
  };

  const handleFetch = async (id: string) => {
    try {
      await dataSourceApi.fetch(id);
      toast.success('Fetch triggered');
      fetchSources();
    } catch (error) {
      toast.error('Failed to trigger fetch');
    }
  };

  const handleTriggerAll = async () => {
    try {
      await dataSourceApi.triggerAll();
      toast.success('Ingestion triggered for all sources');
      fetchSources();
    } catch (error) {
      toast.error('Failed to trigger ingestion');
    }
  };

  const typeIcons: Record<string, string> = {
    weather: '🌤️',
    satellite: '🛰️',
    news: '📰',
    disaster: '🚨',
    traffic: '🚗',
    air_quality: '💨',
    social: '📱',
    sensor: '📡',
    custom: '⚙️',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Sources</h1>
          <p className="text-gray-400">Manage external data ingestion sources</p>
        </div>
        <button
          onClick={handleTriggerAll}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Trigger All
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400">Total Sources</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400">Active</p>
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400">Total Fetches</p>
            <p className="text-2xl font-bold text-primary-400">{stats.totalFetches}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400">Errors</p>
            <p className="text-2xl font-bold text-red-400">{stats.totalErrors}</p>
          </div>
        </div>
      )}

      {/* Source List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-32" />
            </div>
          ))
        ) : sources.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700/50">
            <CircleStackIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No data sources configured</h3>
            <p className="text-gray-400">
              Data sources are automatically configured from environment variables
            </p>
          </div>
        ) : (
          sources.map((source) => (
            <div
              key={source.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                    {typeIcons[source.type] || '📊'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-white">{source.name}</h3>
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        source.status === 'active' && 'bg-green-500/20 text-green-400',
                        source.status === 'inactive' && 'bg-gray-500/20 text-gray-400',
                        source.status === 'error' && 'bg-red-500/20 text-red-400',
                        source.status === 'rate_limited' && 'bg-yellow-500/20 text-yellow-400'
                      )}>
                        {source.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Provider: {source.provider} • Type: {source.type}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Refresh: {Math.round(source.refreshInterval / 60000)} min
                      </span>
                      <span>
                        Fetches: {source.fetchCount}
                      </span>
                      {source.errorCount > 0 && (
                        <span className="text-red-400">
                          Errors: {source.errorCount}
                        </span>
                      )}
                      {source.lastFetchAt && (
                        <span>
                          Last fetch: {new Date(source.lastFetchAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {source.status === 'active' ? (
                    <button
                      onClick={() => handleDeactivate(source.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-yellow-400 rounded-lg transition-colors"
                      title="Deactivate"
                    >
                      <PauseIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(source.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-green-400 rounded-lg transition-colors"
                      title="Activate"
                    >
                      <PlayIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleFetch(source.id)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-primary-400 rounded-lg transition-colors"
                    title="Trigger Fetch"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Built-in Sources Info */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Built-in Data Sources</h3>
        <p className="text-sm text-gray-400 mb-4">
          ASTRYX automatically ingests data from these free-tier APIs:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🌍', name: 'USGS Earthquakes' },
            { icon: '🛰️', name: 'NASA EONET' },
            { icon: '🌤️', name: 'OpenWeatherMap' },
            { icon: '📰', name: 'NewsAPI' },
            { icon: '🚗', name: 'TomTom Traffic' },
            { icon: '💨', name: 'AirVisual' },
            { icon: '🌪️', name: 'Weatherbit' },
            { icon: '📡', name: 'GDELT' },
          ].map((source) => (
            <div
              key={source.name}
              className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg"
            >
              <span>{source.icon}</span>
              <span className="text-sm text-gray-300">{source.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
