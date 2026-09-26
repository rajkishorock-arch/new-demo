import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Loader2, Shield } from 'lucide-react';

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
  { id: 1, label: 'Reading input', detail: 'Validating safe string encoding without executing links' },
  { id: 2, label: 'Inspecting structure', detail: 'Parsing protocols, subdomains, and syntax boundaries' },
  { id: 3, label: 'Detecting suspicious signals', detail: 'Evaluating urgency triggers, credential requests, and brand mimicry' },
  { id: 4, label: 'Building risk assessment', detail: 'Calculating explainable threat score from detected indicators' },
  { id: 5, label: 'Preparing recommendations', detail: 'Compiling prioritized defensive actions for your protection' }
];

export const AnalysisScanAnimation: React.FC<AnalysisScanAnimationProps> = ({
  onComplete,
  targetType = 'item'
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    hasCompletedRef.current = false;
    let step = 0;

    // 5 steps @ 320ms each ~ 1.6s total (smooth, restrained timing)
    const interval = setInterval(() => {
      step += 1;
      if (step < SCAN_STEPS.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setTimeout(() => {
            onCompleteRef.current();
          }, 350);
        }
      }
    }, 320);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const progressPercent = Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-sm animate-fade-in text-slate-900">
      <div className="flex items-center justify-between pb-5 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Analyzing {targetType}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating explainable threat signals safely
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-5 overflow-hidden border border-slate-200">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 5-Phase Sequence Checklist */}
      <div className="mt-6 space-y-3">
        {SCAN_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-start justify-between text-xs transition-all duration-200 ${
                isDone
                  ? 'text-slate-700'
                  : isCurrent
                  ? 'text-slate-900 font-medium bg-blue-50/70 p-2.5 rounded-xl -mx-2.5 border border-blue-100'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <div>
                  <span className={isCurrent ? 'text-blue-900 font-semibold' : ''}>
                    Phase {step.id}: {step.label}
                  </span>
                  {isCurrent && (
                    <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>

              <span className="text-[11px] text-slate-500">
                {isDone ? 'Completed' : isCurrent ? 'In progress' : 'Waiting'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero-execution sandbox • No links opened</span>
        </span>
        <span className="text-slate-400">Heuristic Engine</span>
      </div>
    </div>
  );
};
