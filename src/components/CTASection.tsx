import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-cyber-900 via-cyber-950 to-cyber-950 border-t border-cyber-800">
      {/* Background glow circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider mb-6">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
          <span>Defensive Zero-Execution Analysis</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Have something suspicious? <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            Decode it before you trust it.
          </span>
        </h2>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Test any URL, email communication, or urgent SMS snippet right now. Receive clear explainable signals, risk breakdown, and actionable defense guidance in seconds.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/decoder"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-glow-cyan transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Analyze a Threat</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/learn"
            className="w-full sm:w-auto px-6 py-3.5 bg-cyber-900 hover:bg-cyber-850 border border-cyber-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <span>Spot the Phish Lab</span>
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-cyber-850 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Never executes live links</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Explainable Heuristics</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-sky-400" />
            <span>Zero Credential Retention</span>
          </div>
        </div>
      </div>
    </section>
  );
};
