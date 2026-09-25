import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Share2,
  Bookmark,
  ExternalLink,
  Info,
  ListOrdered,
  FileSearch,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { AnalysisResult, Finding } from '../engine/phishingEngine';
import { StatusBadge } from './StatusBadge';

interface ThreatResultCardProps {
  result: AnalysisResult;
  onReset?: () => void;
  onSaveToHistory?: () => void;
  isSaved?: boolean;
}

export const ThreatResultCard: React.FC<ThreatResultCardProps> = ({
  result,
  onReset,
  onSaveToHistory,
  isSaved = false
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'findings' | 'evidence' | 'actions'>('findings');

  // Animated score count-up
  useEffect(() => {
    let start = 0;
    const end = result.riskScore;
    const duration = 800; // ms
    const incrementTime = 25;
    const step = Math.max(1, Math.ceil(end / (duration / incrementTime)));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [result.riskScore]);

  const toggleFinding = (id: string) => {
    setExpandedFindings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAllFindings = () => {
    const allExpanded = result.findings.every(f => expandedFindings[f.id]);
    const newState: Record<string, boolean> = {};
    result.findings.forEach(f => {
      newState[f.id] = !allExpanded;
    });
    setExpandedFindings(newState);
  };

  const copySummaryReport = () => {
    const reportText = `[PHISHING DECODER REPORT]
Target: ${result.inputSummary}
Threat Assessment: ${result.riskLevel} (${result.riskScore}/100)
Why: ${result.summaryWhy}

Signals Detected (${result.findings.length}):
${result.findings.map(f => `- [${f.severity}] ${f.title}: ${f.explanation}`).join('\n')}

Recommended Action:
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Generated via Phishing Decoder • Explainable Rule-Based Security Engine`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color schemes for score wheel
  const getScoreTheme = () => {
    switch (result.riskLevel) {
      case 'HIGH RISK':
        return {
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          bgColor: 'bg-rose-950/30',
          meterBg: 'from-rose-500 to-red-600',
          glow: 'shadow-glow-red'
        };
      case 'SUSPICIOUS':
        return {
          textColor: 'text-orange-400',
          borderColor: 'border-orange-500/40',
          bgColor: 'bg-orange-950/30',
          meterBg: 'from-orange-500 to-amber-600',
          glow: 'shadow-[0_0_25px_-5px_rgba(249,115,22,0.25)]'
        };
      case 'CAUTION':
        return {
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          bgColor: 'bg-amber-950/30',
          meterBg: 'from-amber-400 to-yellow-600',
          glow: 'shadow-glow-amber'
        };
      case 'LOW':
      default:
        return {
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/40',
          bgColor: 'bg-emerald-950/30',
          meterBg: 'from-emerald-400 to-teal-600',
          glow: 'shadow-glow-emerald'
        };
    }
  };

  const theme = getScoreTheme();

  return (
    <div className="bg-cyber-900 border border-cyber-700/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up text-slate-100">
      {/* Top Banner / Assessment Header */}
      <div className={`p-6 sm:p-8 border-b border-cyber-800 ${theme.bgColor} transition-colors`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-cyber-950/80 border border-cyber-800 px-2.5 py-1 rounded-md">
                THREAT ASSESSMENT REPORT
              </span>
              <StatusBadge level={result.riskLevel} size="md" />
              <span className="text-[11px] text-slate-400 font-mono">
                {result.type.toUpperCase()} ANALYSIS
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {result.riskLevel === 'HIGH RISK' && 'High Probability Phishing Threat'}
                {result.riskLevel === 'SUSPICIOUS' && 'Elevated Phishing Signals Detected'}
                {result.riskLevel === 'CAUTION' && 'Potential Risk / Caution Advised'}
                {result.riskLevel === 'LOW' && 'Low Risk Heuristic Assessment'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 break-all bg-cyber-950/60 p-2.5 rounded-xl border border-cyber-800/80">
                <span className="text-slate-500 mr-2">TARGET:</span>
                <span className="text-sky-300">{result.inputSummary}</span>
              </p>
            </div>
          </div>

          {/* Animated Score Card */}
          <div className="flex sm:flex-row lg:flex-col items-center justify-between sm:justify-start lg:items-end gap-3 bg-cyber-950/80 border border-cyber-800 p-4 sm:p-5 rounded-2xl shrink-0">
            <div className="text-left lg:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Risk Score Index
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tighter ${theme.textColor}`}>
                  {animatedScore}
                </span>
                <span className="text-slate-500 text-sm font-semibold">/100</span>
              </div>
            </div>

            {/* Micro visual gauge */}
            <div className="w-28 sm:w-36 bg-cyber-900 h-2 rounded-full overflow-hidden border border-cyber-800">
              <div
                className={`h-full bg-gradient-to-r ${theme.meterBg} transition-all duration-700 ease-out`}
                style={{ width: `${animatedScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Why this result? Banner */}
        <div className="mt-6 p-4 rounded-xl bg-cyber-950/80 border border-cyber-800/90 flex items-start space-x-3">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Why this result?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {result.summaryWhy}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar / Section Tabs */}
      <div className="px-6 sm:px-8 py-3 bg-cyber-950/90 border-b border-cyber-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('findings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'findings'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-cyber-850'
            }`}
          >
            Signals & Findings ({result.findings.length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'evidence'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-cyber-850'
            }`}
          >
            Structural Evidence
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'actions'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-cyber-850'
            }`}
          >
            Recommended Defense ({result.recommendations.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {onSaveToHistory && (
            <button
              onClick={onSaveToHistory}
              disabled={isSaved}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isSaved
                  ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
                  : 'bg-cyber-850 hover:bg-cyber-800 border-cyber-700 text-slate-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved to Profile' : 'Save to History'}</span>
            </button>
          )}

          <button
            onClick={copySummaryReport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyber-850 hover:bg-cyber-800 border border-cyber-700 text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyber-800 hover:bg-cyber-700 text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8">
        {/* TAB 1: SIGNALS & FINDINGS */}
        {activeTab === 'findings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Detected Security Indicators
              </h3>
              {result.findings.length > 0 && (
                <button
                  onClick={toggleAllFindings}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  {result.findings.every(f => expandedFindings[f.id]) ? 'Collapse All' : 'Expand All'}
                </button>
              )}
            </div>

            {result.findings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-cyber-950/60 border border-cyber-800 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">No Suspicious Signals Identified</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Our explainable rule engine did not trigger any known phishing patterns, deceptive structures, or social-engineering lures for this input.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.findings.map(finding => {
                  const isExpanded = !!expandedFindings[finding.id];

                  return (
                    <div
                      key={finding.id}
                      className="bg-cyber-950/80 border border-cyber-800 rounded-xl p-4 sm:p-5 transition-all hover:border-cyber-700"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge level={finding.severity} size="sm" />
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              {finding.title}
                            </h4>
                          </div>

                          <div className="pt-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                              Why it matters:
                            </span>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {finding.explanation}
                            </p>
                          </div>

                          {finding.evidence && (
                            <div className="pt-2">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                                Triggered Evidence:
                              </span>
                              <span className="inline-block mt-0.5 font-mono text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 px-2 py-0.5 rounded">
                                {finding.evidence}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleFinding(finding.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-800 shrink-0 transition-colors"
                          aria-label={isExpanded ? 'Collapse finding details' : 'Expand finding details'}
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Expandable Technical Details & Advice */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-cyber-800/90 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
                          <div className="p-3 bg-cyber-900 rounded-lg border border-cyber-800 space-y-1">
                            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                              Technical Threat Context
                            </span>
                            <p className="text-slate-300 leading-relaxed">
                              {finding.technicalDetail}
                            </p>
                          </div>

                          <div className="p-3 bg-cyber-900 rounded-lg border border-cyber-800 space-y-1">
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                              Mitigation Directive
                            </span>
                            <p className="text-slate-300 leading-relaxed">
                              {finding.mitigationAdvice}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DETAILED EVIDENCE PANEL */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-cyber-800">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Inspected Technical Components
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted structural tokens and flagged indicators
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Type: {result.evidenceMap.parsedType.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(result.evidenceMap.components).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3.5 bg-cyber-950/80 border border-cyber-800 rounded-xl space-y-1"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <p className="text-xs font-mono font-medium text-slate-200 truncate">
                    {String(val)}
                  </p>
                </div>
              ))}
            </div>

            {/* Flagged Phrases / Trigger Evidence */}
            {result.evidenceMap.flaggedPhrases.length > 0 && (
              <div className="p-4 bg-cyber-950/80 border border-cyber-800 rounded-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Flagged Indicators & Keywords:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.evidenceMap.flaggedPhrases.map((phrase, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-mono bg-amber-950/40 border border-amber-800/50 text-amber-200 rounded-md"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Guarantee */}
            <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs text-slate-300 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-200">Zero-Execution Text Analysis:</span>
                <p className="text-slate-400 mt-0.5">
                  Phishing Decoder analyzes the text and structural grammar you provide. It never makes live HTTP connections to target servers, downloads attachments, or opens submitted links.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECOMMENDED DEFENSE (WHAT SHOULD YOU DO?) */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-950/60 to-cyber-950 border border-sky-800/50 rounded-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-sky-600 text-white rounded-xl shadow-xs">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                    What Should You Do?
                  </h3>
                  <p className="text-xs text-sky-300">
                    Defensive response protocol prioritized for this threat level ({result.riskLevel})
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3.5 p-4 bg-cyber-950/80 border border-cyber-800 rounded-xl"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-950 border border-sky-600/40 text-sky-400 font-mono text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-cyber-950/60 border border-cyber-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
              <span>Rule-Based Defense Guidance</span>
              <span className="font-mono text-sky-400 font-bold">Priority: Immediate</span>
            </div>
          </div>
        )}
      </div>

      {/* Prominent Footer Recommendation Strip */}
      <div className="px-6 sm:px-8 py-4 bg-cyber-950 border-t border-cyber-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Explainable Analysis • Evaluated at {new Date(result.inspectedAt).toLocaleTimeString()}</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          Engine: {result.engineVersion}
        </span>
      </div>
    </div>
  );
};
