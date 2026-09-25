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
          bg: 'bg-rose-950/50 border-rose-600/40 text-rose-300',
          dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'SUSPICIOUS':
      case 'HIGH':
        return {
          bg: 'bg-orange-950/50 border-orange-600/40 text-orange-300',
          dot: 'bg-orange-500 shadow-[0_0_8px_#f97316]',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
        };
      case 'CAUTION':
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/50 border-amber-600/40 text-amber-300',
          dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'LOW':
      case 'INFORMATIONAL':
      case 'SAFE':
      default:
        return {
          bg: 'bg-emerald-950/50 border-emerald-600/40 text-emerald-300',
          dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
