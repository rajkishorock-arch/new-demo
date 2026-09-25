import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { RiskLevel } from '../engine/phishingEngine';

export interface CapabilityItem {
  id: string;
  icon: LucideIcon;
  title: string;
  badge: RiskLevel | string;
  whatItDoes: string;
  whyItMatters: string;
  actionText: string;
  actionHref?: string;
}

interface CapabilityCardProps {
  item: CapabilityItem;
}

export const CapabilityCard: React.FC<CapabilityCardProps> = ({ item }) => {
  const Icon = item.icon;

  return (
    <div className="group relative bg-cyber-900/90 border border-cyber-700/80 hover:border-sky-500/60 rounded-2xl p-6 shadow-xl transition-all duration-300 flex flex-col justify-between hover:translate-y-[-2px]">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-cyber-950 border border-cyber-700 group-hover:border-sky-500/50 flex items-center justify-center text-sky-400 group-hover:text-cyan-300 transition-colors shadow-xs">
            <Icon className="w-6 h-6 transition-transform group-hover:scale-110 duration-200" />
          </div>
          <span className="text-[10px] font-mono uppercase bg-cyber-950 border border-cyber-800 text-sky-400 px-2 py-0.5 rounded font-bold">
            {item.badge}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
          {item.title}
        </h3>

        {/* What It Does */}
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {item.whatItDoes}
        </p>

        {/* Why It Matters */}
        <div className="mt-4 p-3.5 bg-cyber-950/80 rounded-xl border border-cyber-800 text-xs space-y-1">
          <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px] block">
            Why It Matters
          </span>
          <p className="text-slate-400 leading-normal">
            {item.whyItMatters}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-5 border-t border-cyber-800/80 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500">Heuristic Engine</span>
        <Link
          to={item.actionHref || '/decoder'}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>{item.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};
