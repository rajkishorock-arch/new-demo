import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  MousePointer
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface DetectedPhrase {
  id: string;
  phrase: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  explanation: string;
  evidenceNote: string;
}

interface InteractiveSample {
  id: string;
  type: 'SMS Message' | 'Email';
  sender: string;
  subject?: string;
  score: number;
  riskLevel: 'HIGH RISK' | 'SUSPICIOUS' | 'CAUTION';
  summary: string;
  fullText: string;
  detectedPhrases: DetectedPhrase[];
}

const DEMO_SAMPLES: InteractiveSample[] = [
  {
    id: 'sms-bank',
    type: 'SMS Message',
    sender: '+1 (888) 492-0193',
    score: 84,
    riskLevel: 'HIGH RISK',
    summary: 'Detected artificial deadline panic, PIN credential solicitation, and deceptive lookalike domain.',
    fullText: 'CITI ALERT: Your debit card will be suspended within 12 hours due to unverified transactions. Please verify your credentials and card PIN immediately at https://citi-fraud-alert.com-auth.xyz/login to keep account active.',
    detectedPhrases: [
      {
        id: 'phrase-urgency',
        phrase: 'will be suspended within 12 hours',
        category: 'Urgency & Pressure Signal',
        severity: 'HIGH',
        explanation: 'Attackers manufacture arbitrary deadlines to induce panic, forcing victims to act hastily before verifying with their bank.',
        evidenceNote: 'Deadline intimidation: "within 12 hours" paired with threat of account suspension.'
      },
      {
        id: 'phrase-credential',
        phrase: 'verify your credentials and card PIN immediately',
        category: 'Credential / PIN Solicitation',
        severity: 'CRITICAL',
        explanation: 'Legitimate financial institutions state explicitly they will never request your secret PIN or login password via SMS.',
        evidenceNote: 'Direct solicitation of secret multi-factor credentials.'
      },
      {
        id: 'phrase-domain',
        phrase: 'https://citi-fraud-alert.com-auth.xyz/login',
        category: 'Deceptive Lookalike Domain',
        severity: 'HIGH',
        explanation: 'The actual registered domain is "com-auth.xyz", not "citi.com". Lookalike subdomains are designed to trick smartphone users.',
        evidenceNote: 'Spoofed brand in subdomain; suspicious generic TLD (.xyz).'
      }
    ]
  },
  {
    id: 'email-payroll',
    type: 'Email',
    sender: 'payroll-desk@corporate-update-portal.net',
    subject: 'Action Required: Pending Direct Deposit Verification',
    score: 78,
    riskLevel: 'HIGH RISK',
    summary: 'Pretexts as human resources with coercive financial urgency and an unverified external portal.',
    fullText: 'Dear Employee, your upcoming direct deposit was placed on administrative hold. Confirm your corporate password and bank account number within 24 hours at http://portal.direct-payroll-verify.net/auth or payments will be deferred.',
    detectedPhrases: [
      {
        id: 'phrase-hr-urgency',
        phrase: 'within 24 hours or payments will be deferred',
        category: 'Financial Coercion',
        severity: 'HIGH',
        explanation: 'Threatening payroll delays causes emotional anxiety, prompting rapid compliance without secondary verification.',
        evidenceNote: 'Threatened withholding of scheduled direct deposit.'
      },
      {
        id: 'phrase-hr-creds',
        phrase: 'Confirm your corporate password and bank account number',
        category: 'Sensitive Data Harvesting',
        severity: 'CRITICAL',
        explanation: 'Corporate HR departments do not ask for cleartext account numbers or passwords through unsolicited external emails.',
        evidenceNote: 'Multiple high-value credentials requested simultaneously.'
      },
      {
        id: 'phrase-hr-link',
        phrase: 'http://portal.direct-payroll-verify.net/auth',
        category: 'Insecure External Domain',
        severity: 'HIGH',
        explanation: 'Unencrypted HTTP endpoint pointing to an unregistered third-party domain instead of your verified internal portal.',
        evidenceNote: 'Unencrypted plain HTTP link; untrusted domain registration.'
      }
    ]
  }
];

export const InteractiveHeroShowcase: React.FC = () => {
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [activePhraseId, setActivePhraseId] = useState<string>(
    DEMO_SAMPLES[0].detectedPhrases[0].id
  );

  const sample = DEMO_SAMPLES[activeSampleIndex];
  const activePhrase =
    sample.detectedPhrases.find(p => p.id === activePhraseId) ||
    sample.detectedPhrases[0];

  const handleSelectSample = (idx: number) => {
    setActiveSampleIndex(idx);
    setActivePhraseId(DEMO_SAMPLES[idx].detectedPhrases[0].id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 sm:mt-12 text-left">
      {/* Clean White Shell with Subtle Slate Border & Soft Shadow */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Top Control Bar: Segmented Tabs & Guide */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Interactive Example:
            </span>
            <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5 border border-slate-200">
              {DEMO_SAMPLES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(idx)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeSampleIndex === idx
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-medium">
            <MousePointer className="w-3.5 h-3.5" />
            <span>Hover or click highlighted text to inspect signals</span>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Realistic Message Preview (7 Cols) */}
          <div className="p-6 lg:p-7 lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Message Header */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[11px] block">From:</span>
                  <div className="font-mono text-slate-800 text-xs font-semibold">
                    {sample.sender}
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {sample.type}
                </span>
              </div>

              {sample.subject && (
                <div className="text-xs text-slate-800 font-semibold">
                  <span className="text-slate-400 font-normal mr-1.5">Subject:</span>
                  {sample.subject}
                </div>
              )}

              {/* Message Body with Interactive Highlights */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-slate-800">
                {sample.id === 'sms-bank' ? (
                  <p>
                    <span className="text-slate-600">CITI ALERT: Your debit card </span>
                    <button
                      onClick={() => setActivePhraseId('phrase-urgency')}
                      onMouseEnter={() => setActivePhraseId('phrase-urgency')}
                      className={`inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all font-medium text-left ${
                        activePhraseId === 'phrase-urgency'
                          ? 'bg-amber-200/80 text-amber-950 border-b-2 border-amber-600 ring-2 ring-amber-300'
                          : 'bg-amber-100 text-amber-900 border-b border-amber-400 hover:bg-amber-200/60'
                      }`}
                    >
                      will be suspended within 12 hours
                    </button>
                    <span className="text-slate-600"> due to unverified transactions. Please </span>
                    <button
                      onClick={() => setActivePhraseId('phrase-credential')}
                      onMouseEnter={() => setActivePhraseId('phrase-credential')}
                      className={`inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all font-medium text-left ${
                        activePhraseId === 'phrase-credential'
                          ? 'bg-rose-200/80 text-rose-950 border-b-2 border-rose-600 ring-2 ring-rose-300'
                          : 'bg-rose-100 text-rose-900 border-b border-rose-400 hover:bg-rose-200/60'
                      }`}
                    >
                      verify your credentials and card PIN immediately
                    </button>
                    <span className="text-slate-600"> at </span>
                    <button
                      onClick={() => setActivePhraseId('phrase-domain')}
                      onMouseEnter={() => setActivePhraseId('phrase-domain')}
                      className={`inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all font-mono text-xs sm:text-sm text-left ${
                        activePhraseId === 'phrase-domain'
                          ? 'bg-blue-200/80 text-blue-950 border-b-2 border-blue-600 ring-2 ring-blue-300'
                          : 'bg-blue-100 text-blue-900 border-b border-blue-400 hover:bg-blue-200/60'
                      }`}
                    >
                      https://citi-fraud-alert.com-auth.xyz/login
                    </button>
                    <span className="text-slate-600"> to keep account active.</span>
                  </p>
                ) : (
                  <p>
                    <span className="text-slate-600">Dear Employee, your upcoming direct deposit was placed on administrative hold. </span>
                    <button
                      onClick={() => setActivePhraseId('phrase-hr-creds')}
                      onMouseEnter={() => setActivePhraseId('phrase-hr-creds')}
                      className={`inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all font-medium text-left ${
                        activePhraseId === 'phrase-hr-creds'
                          ? 'bg-rose-200/80 text-rose-950 border-b-2 border-rose-600 ring-2 ring-rose-300'
                          : 'bg-rose-100 text-rose-900 border-b border-rose-400 hover:bg-rose-200/60'
                      }`}
                    >
                      Confirm your corporate password and bank account number
                    </button>
                    <span className="text-slate-600"> </span>
                    <button
                      onClick={() => setActivePhraseId('phrase-hr-urgency')}
                      onMouseEnter={() => setActivePhraseId('phrase-hr-urgency')}
                      className={`inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all font-medium text-left ${
                        activePhraseId === 'phrase-hr-urgency'
                          ? 'bg-amber-200/80 text-amber-950 border-b-2 border-amber-600 ring-2 ring-amber-300'
                          : 'bg-amber-100 text-amber-900 border-b border-amber-400 hover:bg-amber-200/60'
                      }`}
                    >
                      within 24 hours or payments will be deferred
                    </button>
                    <span className="text-slate-600"> at </span>
                    <button
                      onClick={() => setActivePhraseId('phrase-hr-link')}
                      onMouseEnter={() => setActivePhraseId('phrase-hr-link')}
                      className={`inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all font-mono text-xs sm:text-sm text-left ${
                        activePhraseId === 'phrase-hr-link'
                          ? 'bg-blue-200/80 text-blue-950 border-b-2 border-blue-600 ring-2 ring-blue-300'
                          : 'bg-blue-100 text-blue-900 border-b border-blue-400 hover:bg-blue-200/60'
                      }`}
                    >
                      http://portal.direct-payroll-verify.net/auth
                    </button>
                    <span className="text-slate-600">.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Helper */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero execution — inspected safely</span>
              </span>
              <span className="text-[11px]">
                {sample.detectedPhrases.length} distinct signals detected
              </span>
            </div>
          </div>

          {/* Right Column: Live Inspector & Score (5 Cols) */}
          <div className="p-6 lg:p-7 lg:col-span-5 bg-slate-50/50 flex flex-col justify-between space-y-6">
            {/* Score & Risk Summary */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Calculated Threat Index
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {sample.score}
                    </span>
                    <span className="text-sm font-medium text-slate-400">/ 100</span>
                  </div>
                </div>

                <StatusBadge level={sample.riskLevel} size="md" />
              </div>

              {/* Active Signal Inspector Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">
                    {activePhrase.category}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      activePhrase.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : activePhrase.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {activePhrase.severity}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    {activePhrase.explanation}
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Evidence: </span>
                    {activePhrase.evidenceNote}
                  </p>
                </div>
              </div>

              {/* Detected Signals Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 block">
                  All Signals in this Sample:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sample.detectedPhrases.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActivePhraseId(p.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left font-medium ${
                        activePhraseId === p.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {p.category.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Action Link */}
            <div className="pt-2">
              <Link
                to="/decoder"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 group"
              >
                <span>Analyze Your Own Threat in Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
