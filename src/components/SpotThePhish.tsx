import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface PhishScenario {
  id: string;
  type: 'SMS' | 'EMAIL' | 'URL';
  sender: string;
  subjectOrPreview: string;
  body: string;
  signalsAvailable: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  verdictExplanation: string;
}

const SCENARIOS: PhishScenario[] = [
  {
    id: 'scenario-1',
    type: 'SMS',
    sender: '+1 (800) 555-0199 [ALERT]',
    subjectOrPreview: 'Bank Security Notification',
    body: 'URGENT: Your online banking session was suspended due to unauthorized access. Confirm your credentials within 10 minutes at https://secure-chase-session.com-verify.xyz/login to unlock funds.',
    signalsAvailable: [
      {
        id: 'urgency',
        label: 'Artificial Urgency ("within 10 minutes")',
        isCorrect: true,
        explanation: 'Pressures the recipient to act immediately before thinking critically.'
      },
      {
        id: 'credential_req',
        label: 'Direct Credential Request ("Confirm credentials")',
        isCorrect: true,
        explanation: 'Banks do not demand passwords or credentials through SMS links.'
      },
      {
        id: 'fake_domain',
        label: 'Deceptive Hostname ("chase-session.com-verify.xyz")',
        isCorrect: true,
        explanation: 'The root domain is ".xyz" with "chase" abused as a secondary subdomain keyword.'
      },
      {
        id: 'threat',
        label: 'Coercive Penalty ("suspended", "unlock funds")',
        isCorrect: true,
        explanation: 'Manufactures fear of financial loss to bypass skepticism.'
      }
    ],
    verdictExplanation:
      'All 4 signals are classic hallmarks of smishing (SMS phishing). Legitimate financial institutions never demand immediate credential re-verification over emergency SMS links.'
  },
  {
    id: 'scenario-2',
    type: 'EMAIL',
    sender: 'IT-Helpdesk <internal-support@corp-update-portal.top>',
    subjectOrPreview: 'Mandatory Password Migration Required',
    body: 'Dear Valued Employee,\n\nOur system administrator is migrating the corporate email exchange. You are required to confirm your current password and two-factor authenticator code to prevent mailbox termination before 5:00 PM today.\n\nClick here to submit your credentials: http://192.168.10.88/portal/auth',
    signalsAvailable: [
      {
        id: 'generic_salutation',
        label: 'Generic Salutation ("Dear Valued Employee")',
        isCorrect: true,
        explanation: 'Mass phishers use impersonal greetings rather than your real company name.'
      },
      {
        id: 'otp_harvest',
        label: '2FA / Authenticator Code Solicitation',
        isCorrect: true,
        explanation: 'IT staff will never ask for your private 2FA codes or passwords.'
      },
      {
        id: 'ip_address',
        label: 'Bare IP Address Destination ("192.168.10.88")',
        isCorrect: true,
        explanation: 'Enterprise portals run on verified corporate domain names, not bare unencrypted IP addresses.'
      },
      {
        id: 'suspicious_tld',
        label: 'Suspicious Sender TLD (".top")',
        isCorrect: true,
        explanation: 'The email originates from an external disposable domain rather than your corporate company domain.'
      }
    ],
    verdictExplanation:
      'This is an internal spear-phishing simulation. Legitimate corporate IT will never ask for your password or MFA code, nor will they host official tools on raw IP addresses.'
  },
  {
    id: 'scenario-3',
    type: 'URL',
    sender: 'Browser Bar Observation',
    subjectOrPreview: 'Suspicious Payment Portal',
    body: 'http://paypal.com@verify-account-security-center.info:8080/signin/webscr?redirect=token_99',
    signalsAvailable: [
      {
        id: 'at_symbol',
        label: 'Userinfo "@" Obfuscation (paypal.com@...)',
        isCorrect: true,
        explanation: 'The browser connects to "verify-account-security-center.info", ignoring the preceding "paypal.com@".'
      },
      {
        id: 'non_standard_port',
        label: 'Non-Standard Web Port (:8080)',
        isCorrect: true,
        explanation: 'Legitimate payment portals operate over standard encrypted HTTPS port 443.'
      },
      {
        id: 'unencrypted_http',
        label: 'Unencrypted HTTP Protocol',
        isCorrect: true,
        explanation: 'A genuine PayPal service would strictly enforce secure HTTPS/TLS.'
      },
      {
        id: 'keyword_stuffing',
        label: 'Credential Keyword Stuffing (/signin/webscr)',
        isCorrect: true,
        explanation: 'Simulates genuine PayPal backend scripts to fool casual inspection.'
      }
    ],
    verdictExplanation:
      'This URL is highly deceptive. The "@" symbol is an old browser trick to make victims think they are visiting PayPal when they are actually contacting a rogue server on port 8080.'
  }
];

export const SpotThePhish: React.FC = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>([]);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const scenario = SCENARIOS[currentScenarioIndex];

  const toggleSignal = (signalId: string) => {
    if (hasEvaluated) return;
    setSelectedSignalIds(prev =>
      prev.includes(signalId) ? prev.filter(id => id !== signalId) : [...prev, signalId]
    );
  };

  const handleSelectAll = () => {
    if (hasEvaluated) return;
    const allIds = scenario.signalsAvailable.map(s => s.id);
    setSelectedSignalIds(allIds);
  };

  const handleEvaluate = () => {
    if (selectedSignalIds.length === 0) return;
    setHasEvaluated(true);
  };

  const handleNextScenario = () => {
    setSelectedSignalIds([]);
    setHasEvaluated(false);
    setCurrentScenarioIndex(prev => (prev + 1) % SCENARIOS.length);
  };

  const correctCount = selectedSignalIds.filter(id =>
    scenario.signalsAvailable.find(s => s.id === id)?.isCorrect
  ).length;

  const totalCorrect = scenario.signalsAvailable.filter(s => s.isCorrect).length;

  return (
    <div className="bg-cyber-900 border border-cyber-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-cyber-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-sky-600 to-cyan-600 text-white rounded-xl shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Spot the Phish — Interactive Awareness Lab
              </h3>
              <span className="text-[10px] font-mono uppercase bg-sky-950 border border-sky-800 text-sky-400 px-2 py-0.5 rounded">
                SAFE SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Can you identify all the deceptive signals before clicking?
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span>Case {currentScenarioIndex + 1} of {SCENARIOS.length}</span>
        </div>
      </div>

      {/* Scenario Simulator Card */}
      <div className="bg-cyber-950 border border-cyber-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-cyber-850 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-cyber-800 text-[10px] font-mono text-sky-300 font-bold">
              {scenario.type}
            </span>
            <span className="font-mono text-slate-300">From: {scenario.sender}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Fictional Safe Case</span>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {scenario.subjectOrPreview}
          </div>
          <div className="font-mono text-xs sm:text-sm text-amber-200 bg-cyber-900/90 p-3.5 rounded-lg border border-amber-900/40 leading-relaxed break-words whitespace-pre-wrap">
            {scenario.body}
          </div>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Select all phishing signals you notice in this case:</span>
          </label>
          {!hasEvaluated && (
            <button
              onClick={handleSelectAll}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              Select All Applicable
            </button>
          )}
        </div>

        {/* Multi-Select Signal Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenario.signalsAvailable.map(signal => {
            const isSelected = selectedSignalIds.includes(signal.id);

            let borderStyle = 'border-cyber-800 bg-cyber-950/70 hover:border-cyber-700';
            if (hasEvaluated) {
              if (signal.isCorrect && isSelected) {
                borderStyle = 'border-emerald-600/50 bg-emerald-950/30 text-emerald-200';
              } else if (signal.isCorrect && !isSelected) {
                borderStyle = 'border-amber-600/50 bg-amber-950/30 text-amber-200';
              } else if (!signal.isCorrect && isSelected) {
                borderStyle = 'border-rose-600/50 bg-rose-950/30 text-rose-200';
              }
            } else if (isSelected) {
              borderStyle = 'border-sky-500 bg-sky-950/40 text-white';
            }

            return (
              <div
                key={signal.id}
                onClick={() => toggleSignal(signal.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${borderStyle}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  disabled={hasEvaluated}
                  className="w-4 h-4 rounded text-sky-600 bg-cyber-900 border-cyber-700 focus:ring-0 mt-0.5 cursor-pointer"
                />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold block">{signal.label}</span>
                  {hasEvaluated && (
                    <p className="text-[11px] text-slate-400 leading-normal animate-fade-in">
                      {signal.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {!hasEvaluated ? (
          <button
            onClick={handleEvaluate}
            disabled={selectedSignalIds.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Evaluate My Analysis ({selectedSignalIds.length} selected)</span>
          </button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Feedback Result Banner */}
            <div className="p-4 rounded-xl bg-cyber-950 border border-cyber-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {correctCount === totalCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="text-sm font-bold text-white">
                    {correctCount === totalCorrect
                      ? 'Spot On! All deceptive signals correctly identified.'
                      : `You identified ${correctCount} of ${totalCorrect} key signals.`}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Accuracy: {Math.round((correctCount / totalCorrect) * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {scenario.verdictExplanation}
              </p>
            </div>

            <button
              onClick={handleNextScenario}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-cyber-800 hover:bg-cyber-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <span>Next Simulation Case</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
