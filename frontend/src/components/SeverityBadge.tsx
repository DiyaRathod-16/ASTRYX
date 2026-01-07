import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Severity } from '../types';

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, showIcon = true }) => {
  const config = {
    Critical: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      icon: AlertTriangle
    },
    High: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/50',
      text: 'text-orange-400',
      icon: AlertCircle
    },
    Medium: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      icon: Info
    },
    Low: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      icon: CheckCircle
    }
  };

  const { bg, border, text, icon: Icon } = config[severity] || config.Medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${border} ${text} border`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {severity}
    </span>
  );
};

export default SeverityBadge;
