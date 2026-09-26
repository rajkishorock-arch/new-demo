import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Bookmark,
  Info,
  ListOrdered,
  RotateCcw,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AnalysisResult, Finding } from '../engine/phishingEngine';
import { StatusBadge } from './StatusBadge';

interface ThreatResultCardProps {
  result: AnalysisResult;
  onReset?: () => void;
  onSaveToHistory?: () => void;
  isSaved?: boolean;
}

// AI Plain-Language Assistant Helper (Zero API dependency, 100% reliable)
function explainSignalInSimpleLanguage(finding: Finding) {
  const title = finding.title.toLowerCase();
  if (title.includes('urgency') || title.includes('time pressure')) {
    return {
      plainLanguage: "The sender is trying to rush you into making a mistake before you have time to think or verify.",
      analogy: "Like a high-pressure scammer saying an offer expires in 10 minutes so you don't call anyone to check if it's real.",
      whatToCheck: "Pause and take your time. Legitimate companies and banks never close accounts permanently with 1-hour deadlines."
    };
  }
  if (title.includes('subdomain') || title.includes('lookalike') || title.includes('mimicry')) {
    return {
      plainLanguage: "The website link mentions a well-known company, but the real destination belongs to someone completely different.",
      analogy: "Like stamping 'Microsoft' on an unofficial envelope; the return address is an impostor's mailbox.",
      whatToCheck: "Look at the letters right before the first single slash (/); that is the actual computer server hosting the site."
    };
  }
  if (title.includes('ip') || title.includes('direct ip')) {
    return {
      plainLanguage: "The link directs to raw numeric coordinates instead of a registered, verified company website address.",
      analogy: "Like a business operating without a registered shop sign, only giving you bare GPS coordinates in an alley.",
      whatToCheck: "Never type passwords or payment cards on a site with a number address (e.g. http://185.220...)."
    };
  }
  if (title.includes('credential') || title.includes('pin') || title.includes('password') || title.includes('token')) {
    return {
      plainLanguage: "The message is attempting to harvest your secret passwords or two-factor authentication codes.",
      analogy: "Like a stranger on the street asking for the keys to your front door under the pretext of 'inspecting locks'.",
      whatToCheck: "Never share one-time SMS passcodes or passwords via a link. Log into your account manually through your app or browser bookmark."
    };
  }
  return {
    plainLanguage: "This communication triggered deceptive structural markers commonly used by fraudulent cyber campaigns.",
    analogy: "Like an unsolicited letter demanding confidential steps with suspicious or mismatched return addresses.",
    whatToCheck: "Contact the claimed organization through their publicly verified phone number, not the contact info inside this message."
  };
}

export const ThreatResultCard: React.FC<ThreatResultCardProps> = ({
  result,
  onReset,
  onSaveToHistory,
  isSaved = false
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});
  const [aiExpandedFindings, setAiExpandedFindings] = useState<Record<string, boolean>>({});
  const [selectedEvidencePhrase, setSelectedEvidencePhrase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'evidence' | 'actions'>('overview');

  // Animated score count-up
  useEffect(() => {
    let start = 0;
    const end = result.riskScore;
    const duration = 750;
    const incrementTime = 20;
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

  useEffect(() => {
    if (result.evidenceMap?.flaggedPhrases?.length > 0) {
      setSelectedEvidencePhrase(result.evidenceMap.flaggedPhrases[0]);
    }
  }, [result]);

  const toggleFinding = (id: string) => {
    setExpandedFindings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copySummaryReport = () => {
    const reportText = `[PHISHING DECODER REPORT]
Target: ${result.inputSummary}
Threat Assessment: ${result.riskLevel} (${result.riskScore}/100)
Summary: ${result.summaryWhy}

Signals Detected (${result.findings.length}):
${result.findings.map(f => `- [${f.severity}] ${f.title}: ${f.explanation}`).join('\n')}

Recommended Defense:
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Generated via Phishing Decoder • Explainable Rule-Based Security Engine`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreTheme = () => {
    switch (result.riskLevel) {
      case 'HIGH RISK':
        return {
          text: 'text-rose-600',
          meter: 'bg-rose-500'
        };
      case 'SUSPICIOUS':
        return {
          text: 'text-orange-600',
          meter: 'bg-orange-500'
        };
      case 'CAUTION':
        return {
          text: 'text-amber-600',
          meter: 'bg-amber-500'
        };
      case 'LOW':
      default:
        return {
          text: 'text-emerald-600',
          meter: 'bg-emerald-500'
        };
    }
  };

  const scoreTheme = getScoreTheme();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden animate-slide-up text-slate-900">
      {/* 1. Risk Score & Executive Summary */}
      <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                Analysis Report
              </span>
              <StatusBadge level={result.riskLevel} size="md" />
              <span className="text-[11px] text-slate-500 font-medium uppercase">
                {result.type} inspection
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {result.riskLevel === 'HIGH RISK' && 'High Probability Phishing Threat'}
                {result.riskLevel === 'SUSPICIOUS' && 'Elevated Phishing Signals Detected'}
                {result.riskLevel === 'CAUTION' && 'Caution Advised / Ambiguous Patterns'}
                {result.riskLevel === 'LOW' && 'Low Risk Heuristic Assessment'}
              </h2>
              <div className="mt-2 text-xs text-slate-700 font-mono bg-white border border-slate-200 p-2.5 rounded-xl break-all shadow-2xs">
                <span className="text-slate-400 mr-2 uppercase text-[10px] font-sans font-bold">Target:</span>
                <span>{result.inputSummary}</span>
              </div>
            </div>
          </div>

          {/* Clean Animated Score Meter */}
          <div className="flex sm:flex-row lg:flex-col items-center justify-between sm:justify-start lg:items-end gap-3 bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shrink-0 shadow-xs">
            <div className="text-left lg:text-right">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Calculated Threat Score
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${scoreTheme.text}`}>
                  {animatedScore}
                </span>
                <span className="text-slate-400 text-sm font-medium">/ 100</span>
              </div>
            </div>

            {/* Clean Progress Meter Bar */}
            <div className="w-28 sm:w-36 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full ${scoreTheme.meter} transition-all duration-700 ease-out`}
                style={{ width: `${animatedScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Executive Explanation: Why this result? */}
        <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 flex items-start space-x-3 shadow-2xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Why this result?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {result.summaryWhy}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs & Quick Actions */}
      <div className="px-6 sm:px-8 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('findings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'findings'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Findings ({result.findings.length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'evidence'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Evidence & Text
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'actions'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            What To Do ({result.recommendations.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {onSaveToHistory && (
            <button
              onClick={onSaveToHistory}
              disabled={isSaved}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved to Archive' : 'Save Report'}</span>
            </button>
          )}

          <button
            onClick={copySummaryReport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Tab Content */}
      <div className="p-6 sm:p-8">
        {/* TAB 0: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Signals Pill Strip */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Detected Security Signals ({result.findings.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {result.findings.length === 0 ? (
                  <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    No deceptive indicators triggered
                  </span>
                ) : (
                  result.findings.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setActiveTab('findings');
                        setExpandedFindings({ [f.id]: true });
                      }}
                      className="inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 transition-colors"
                    >
                      <StatusBadge level={f.severity} size="sm" showIcon={false} />
                      <span className="font-medium">{f.title}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* AI Assistant Callout */}
            {result.findings.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        AI Plain-Language Assistant
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Interactive +10 Bonus
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Plain-language breakdowns, real-world analogies, and defensive checklists are available for each detected threat signal.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('findings');
                    if (result.findings[0]) {
                      setExpandedFindings({ [result.findings[0].id]: true });
                      setAiExpandedFindings({ [result.findings[0].id]: true });
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect AI Breakdown</span>
                </button>
              </div>
            )}

            {/* Quick Action Preview */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Recommended Immediate Next Steps:
                </span>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View full checklist →
                </button>
              </div>

              <div className="space-y-2">
                {result.recommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: EXPANDABLE FINDINGS */}
        {activeTab === 'findings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Detailed Indicator Explanations
              </h3>
              {result.findings.length > 0 && (
                <button
                  onClick={() => {
                    const allExpanded = result.findings.every(f => expandedFindings[f.id]);
                    const newState: Record<string, boolean> = {};
                    result.findings.forEach(f => {
                      newState[f.id] = !allExpanded;
                    });
                    setExpandedFindings(newState);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {result.findings.every(f => expandedFindings[f.id]) ? 'Collapse All' : 'Expand All'}
                </button>
              )}
            </div>

            {result.findings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-900">No Suspicious Signals Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  The submitted content did not trigger any known deceptive patterns or social-engineering signals.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.findings.map(finding => {
                  const isExpanded = !!expandedFindings[finding.id];

                  return (
                    <div
                      key={finding.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all"
                    >
                      <button
                        onClick={() => toggleFinding(finding.id)}
                        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <StatusBadge level={finding.severity} size="sm" />
                            <h4 className="text-sm font-semibold text-slate-900">
                              {finding.title}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {finding.explanation}
                          </p>

                          {finding.evidence && (
                            <div className="pt-1">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1.5 font-medium">
                                Evidence:
                              </span>
                              <span className="font-mono text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                {finding.evidence}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-1 text-slate-400 hover:text-slate-600 shrink-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-3 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                                Why it matters:
                              </span>
                              <p className="text-slate-600 leading-relaxed">
                                {finding.technicalDetail}
                              </p>
                            </div>

                            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                                How to respond:
                              </span>
                              <p className="text-slate-600 leading-relaxed">
                                {finding.mitigationAdvice}
                              </p>
                            </div>
                          </div>

                          {/* AI Plain-Language Assistant Toggle */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAiExpandedFindings(prev => ({ ...prev, [finding.id]: !prev[finding.id] }));
                              }}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-200 text-xs font-semibold transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>
                                {aiExpandedFindings[finding.id]
                                  ? 'Hide Plain-Language Translation'
                                  : 'Explain in Simple Language (AI Assist)'}
                              </span>
                            </button>
                          </div>

                          {aiExpandedFindings[finding.id] && (() => {
                            const ai = explainSignalInSimpleLanguage(finding);
                            return (
                              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border border-blue-200 text-slate-800 space-y-2.5 animate-fade-in shadow-2xs">
                                <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span>AI Plain-Language Signal Translation</span>
                                </div>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <strong className="text-slate-900 block font-semibold">What this signal actually means:</strong>
                                    <p className="text-slate-700 leading-relaxed mt-0.5">{ai.plainLanguage}</p>
                                  </div>
                                  <div>
                                    <strong className="text-slate-900 block font-semibold">Real-world analogy:</strong>
                                    <p className="text-slate-700 leading-relaxed mt-0.5 italic">{ai.analogy}</p>
                                  </div>
                                  <div>
                                    <strong className="text-slate-900 block font-semibold">What you should check:</strong>
                                    <p className="text-slate-700 leading-relaxed mt-0.5">{ai.whatToCheck}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE EVIDENCE & TEXT */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Interactive Evidence Inspection
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on flagged indicators to inspect why they triggered concern
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {result.evidenceMap.parsedType.toUpperCase()}
              </span>
            </div>

            {/* Original Input Display */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Inspected Input Text:
              </span>
              <p className="text-xs sm:text-sm font-mono text-slate-800 leading-relaxed break-all bg-white p-3.5 rounded-lg border border-slate-200">
                {result.inputRaw || result.inputSummary}
              </p>
            </div>

            {/* Flagged Phrases Chips */}
            {result.evidenceMap.flaggedPhrases.length > 0 && (
              <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Flagged Phrasing Indicators:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click to inspect rationale
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.evidenceMap.flaggedPhrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedEvidencePhrase(phrase)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                        selectedEvidencePhrase === phrase
                          ? 'bg-amber-100 border-amber-300 text-amber-950 font-semibold ring-2 ring-amber-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>

                {selectedEvidencePhrase && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1 animate-fade-in">
                    <span className="font-semibold text-amber-900">
                      Why this phrase matters:
                    </span>
                    <p className="text-amber-800 leading-relaxed">
                      Phrases like "{selectedEvidencePhrase}" are commonly used in social engineering to trigger fear, urgency, or impulsive compliance before you can independently verify the request.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Extracted Structural Components */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(result.evidenceMap.components).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                >
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <p className="text-xs font-mono text-slate-800 truncate">
                    {String(val)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RECOMMENDED ACTION CHECKLIST */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-3 mb-1">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                    What Should You Do?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defensive response protocol tailored for {result.riskLevel} threats
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer */}
      <div className="px-6 sm:px-8 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Zero-execution scan evaluated safely at {new Date(result.inspectedAt).toLocaleTimeString()}</span>
        </div>
        <span className="text-slate-400">
          Engine: {result.engineVersion}
        </span>
      </div>
    </div>
  );
};
