import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Shield, Search, Binary, AlertCircle } from 'lucide-react';

interface AnalysisScanAnimationProps {
  onComplete: () => void;
  targetType?: string;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
}

const SCAN_STEPS: StepItem[] = [
  { id: 1, label: 'Parsing safe input structure', detail: 'Tokenizing protocol, path, and message syntax' },
  { id: 2, label: 'Inspecting structural indicators', detail: 'Analyzing subdomain depth, ports, and obfuscation' },
  { id: 3, label: 'Detecting deceptive patterns', detail: 'Scanning against brand impersonation heuristics' },
  { id: 4, label: 'Evaluating social-engineering signals', detail: 'Checking urgency triggers and credential solicitations' },
  { id: 5, label: 'Synthesizing explainable risk score', detail: 'Weighting heuristic rules and severity levels' },
  { id: 6, label: 'Generating actionable defense guide', detail: 'Compiling tailored mitigation recommendations' }
];

export const AnalysisScanAnimation: React.FC<AnalysisScanAnimationProps> = ({
  onComplete,
  targetType = 'item'
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Progress each step smoothly (~250ms per step, ~1.5s total)
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300);
          return prev;
        }
      });
    }, 240);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100);

  return (
    <div className="bg-cyber-900/90 border border-cyber-700/80 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl backdrop-blur-md animate-fade-in text-slate-100">
      <div className="flex items-center justify-between pb-5 border-b border-cyber-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-950 border border-sky-500/30 text-sky-400 rounded-xl relative">
            <Binary className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Rule-Based Security Scan in Progress</span>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating explainable heuristic signals for this {targetType}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2.5 py-1 rounded-lg">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-cyber-950 rounded-full h-1.5 mt-4 overflow-hidden border border-cyber-800">
        <div
          className="bg-gradient-to-r from-sky-500 to-cyan-400 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Sequence Checklist */}
      <div className="mt-6 space-y-3.5">
        {SCAN_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-start justify-between text-xs transition-all duration-200 ${
                isDone
                  ? 'text-slate-300'
                  : isCurrent
                  ? 'text-white font-medium bg-cyber-800/40 p-2 rounded-xl -mx-2 border border-cyber-700/50'
                  : 'text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <div>
                  <span className={isCurrent ? 'text-sky-300' : ''}>{step.label}</span>
                  {isCurrent && (
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>

              <span className="font-mono text-[10px] text-slate-500 uppercase">
                {isDone ? 'DONE' : isCurrent ? 'SCANNING' : 'QUEUED'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-cyber-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span>Local Safe Engine • No external link execution</span>
        </span>
        <span className="font-mono text-[10px] text-slate-500">v2.4 Heuristic</span>
      </div>
    </div>
  );
};
