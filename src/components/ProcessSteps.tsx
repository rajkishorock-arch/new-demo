import React from 'react';
import { ClipboardCheck, Binary, Lightbulb, ShieldAlert, ArrowRight } from 'lucide-react';

interface Step {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    step: '01',
    title: 'PASTE',
    subtitle: 'Safe Text Input',
    description: 'Paste any suspicious link, full email snippet, or smishing text. The system never executes or visits external servers.',
    icon: <ClipboardCheck className="w-5 h-5 text-sky-400" />
  },
  {
    step: '02',
    title: 'ANALYZE',
    subtitle: 'Explainable Rule Scan',
    description: 'Our engine applies deterministic heuristics inspecting subdomain depth, brand spoofing, urgency lures, and credential requests.',
    icon: <Binary className="w-5 h-5 text-cyan-400" />
  },
  {
    step: '03',
    title: 'UNDERSTAND',
    subtitle: 'Evidence & Context',
    description: 'Review the 0-100 risk score, transparent evidence breakdown, and clear explanations of why specific patterns represent danger.',
    icon: <Lightbulb className="w-5 h-5 text-amber-400" />
  },
  {
    step: '04',
    title: 'ACT',
    subtitle: 'Prioritized Defense',
    description: 'Obtain immediate defensive directives—whether to report, isolate credentials, or independently verify with the real institution.',
    icon: <ShieldAlert className="w-5 h-5 text-emerald-400" />
  }
];

export const ProcessSteps: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STEPS.map((item, index) => (
        <div
          key={item.step}
          className="relative bg-cyber-900/90 border border-cyber-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-cyber-600 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-2xl font-black text-slate-600 group-hover:text-sky-400 transition-colors">
                {item.step}
              </span>
              <div className="p-2.5 bg-cyber-950 border border-cyber-800 rounded-xl">
                {item.icon}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block font-bold">
                {item.subtitle}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {item.title}
              </h3>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-cyber-850 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Workflow Stage {index + 1}/4</span>
            {index < 3 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden lg:block" />}
          </div>
        </div>
      ))}
    </div>
  );
};
