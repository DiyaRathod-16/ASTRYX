import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Anomaly } from '../stores';

interface AnomalyCardProps {
  anomaly: Anomaly;
  compact?: boolean;
}

const severityColors = {
  critical: 'border-red-500 bg-red-500/10',
  high: 'border-orange-500 bg-orange-500/10',
  medium: 'border-yellow-500 bg-yellow-500/10',
  low: 'border-green-500 bg-green-500/10',
};

const severityBadges = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const typeIcons: Record<string, string> = {
  weather: '🌪️',
  seismic: '🌍',
  traffic: '🚗',
  environmental: '🌿',
  security: '🔒',
  health: '🏥',
  infrastructure: '🏗️',
  other: '📊',
};

export default function AnomalyCard({ anomaly, compact = false }: AnomalyCardProps) {
  if (compact) {
    return (
      <Link
        to={`/anomalies/${anomaly.id}`}
        className={clsx(
          'block p-3 rounded-lg border-l-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors',
          severityColors[anomaly.severity]
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span>{typeIcons[anomaly.type] || '📊'}</span>
              <h4 className="text-sm font-medium text-white truncate">
                {anomaly.title}
              </h4>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              {anomaly.location}
            </p>
          </div>
          <span className={clsx('badge', severityBadges[anomaly.severity])}>
            {anomaly.severity}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/anomalies/${anomaly.id}`}
      className={clsx(
        'block p-4 rounded-xl border bg-gray-800/50 hover:bg-gray-700/50 transition-all hover:shadow-lg',
        'border-gray-700 hover:border-gray-600'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{typeIcons[anomaly.type] || '📊'}</span>
            <div>
              <h3 className="font-medium text-white truncate">{anomaly.title}</h3>
              <p className="text-xs text-gray-500 capitalize">{anomaly.type}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {anomaly.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5" />
              {anomaly.location}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(anomaly.createdAt), { addSuffix: true })}
            </span>
            <span className="text-primary-400">
              {Math.round(anomaly.confidence * 100)}% confidence
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={clsx('badge', severityBadges[anomaly.severity])}>
            {anomaly.severity}
          </span>
          <span className={clsx(
            'text-xs px-2 py-0.5 rounded',
            anomaly.status === 'approved' && 'bg-green-500/20 text-green-400',
            anomaly.status === 'rejected' && 'bg-red-500/20 text-red-400',
            anomaly.status === 'pending_review' && 'bg-yellow-500/20 text-yellow-400',
            anomaly.status === 'detected' && 'bg-blue-500/20 text-blue-400',
            anomaly.status === 'analyzing' && 'bg-purple-500/20 text-purple-400',
            anomaly.status === 'verified' && 'bg-cyan-500/20 text-cyan-400'
          )}>
            {anomaly.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {anomaly.tags && anomaly.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-700/50">
          {anomaly.tags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded"
            >
              {tag}
            </span>
          ))}
          {anomaly.tags.length > 5 && (
            <span className="text-xs text-gray-500">
              +{anomaly.tags.length - 5} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
