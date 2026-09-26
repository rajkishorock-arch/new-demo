import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';
import { RiskLevel, SignalSeverity } from '../engine/phishingEngine';

interface StatusBadgeProps {
  level: RiskLevel | SignalSeverity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true
}) => {
  const norm = level.toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case 'HIGH RISK':
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          dot: 'bg-rose-600',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
        };
      case 'SUSPICIOUS':
      case 'HIGH':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-700',
          dot: 'bg-orange-600',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
        };
      case 'CAUTION':
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          dot: 'bg-amber-600',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'LOW':
      case 'INFORMATIONAL':
      case 'SAFE':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-600',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        };
    }
  };

  const style = getStyle();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-semibold tracking-wide backdrop-blur-xs transition-colors ${sizeClasses[size]} ${style.bg}`}
    >
      {showIcon && style.icon}
      <span>{norm}</span>
    </span>
  );
};
