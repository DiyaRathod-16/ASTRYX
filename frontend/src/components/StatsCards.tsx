import clsx from 'clsx';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Stats } from '../stores';

interface StatsCardsProps {
  stats: Stats | null;
  loading?: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      name: 'Total Anomalies',
      value: stats?.total ?? '-',
      icon: ChartBarIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Critical',
      value: stats?.critical ?? '-',
      icon: ExclamationTriangleIcon,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      pulse: (stats?.critical ?? 0) > 0,
    },
    {
      name: 'High Priority',
      value: stats?.high ?? '-',
      icon: ArrowTrendingUpIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      name: 'Pending Review',
      value: stats?.pending ?? '-',
      icon: ClockIcon,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.name}
          className={clsx(
            'bg-gray-800 rounded-xl p-6 border border-gray-700/50',
            card.pulse && 'ring-2 ring-red-500/50'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{card.name}</p>
              <p className={clsx(
                'text-3xl font-bold mt-1',
                card.color
              )}>
                {card.value}
              </p>
            </div>
            <div className={clsx(
              'p-3 rounded-lg',
              card.bgColor,
              card.pulse && 'animate-pulse'
            )}>
              <card.icon className={clsx('w-6 h-6', card.color)} />
            </div>
          </div>
          {card.name === 'Total Anomalies' && stats?.last24Hours !== undefined && (
            <p className="text-xs text-gray-500 mt-2">
              +{stats.last24Hours} in last 24 hours
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Mini stat for inline display
export function MiniStat({ label, value, color = 'text-white' }: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className={clsx('text-2xl font-bold', color)}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
