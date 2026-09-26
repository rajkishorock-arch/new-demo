import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Sparkles
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Spot the Phish
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Can you identify all the deceptive signals before clicking?
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Case {currentScenarioIndex + 1} of {SCENARIOS.length}
        </div>
      </div>

      {/* Scenario Simulator Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 font-semibold uppercase border border-slate-200">
              {scenario.type}
            </span>
            <span className="font-mono text-slate-700">From: {scenario.sender}</span>
          </div>
          <span className="text-[11px] text-slate-400">Realistic Case</span>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-700">
            {scenario.subjectOrPreview}
          </div>
          <div className="font-mono text-xs sm:text-sm text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed break-words whitespace-pre-wrap shadow-2xs">
            {scenario.body}
          </div>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Select all phishing signals you notice in this case:</span>
          </label>
          {!hasEvaluated && (
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Select All
            </button>
          )}
        </div>

        {/* Multi-Select Signal Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenario.signalsAvailable.map(signal => {
            const isSelected = selectedSignalIds.includes(signal.id);

            let borderStyle = 'border-slate-200 bg-white hover:bg-slate-50';
            if (hasEvaluated) {
              if (signal.isCorrect && isSelected) {
                borderStyle = 'border-emerald-300 bg-emerald-50 text-emerald-950';
              } else if (signal.isCorrect && !isSelected) {
                borderStyle = 'border-amber-300 bg-amber-50 text-amber-950';
              } else if (!signal.isCorrect && isSelected) {
                borderStyle = 'border-rose-300 bg-rose-50 text-rose-950';
              }
            } else if (isSelected) {
              borderStyle = 'border-blue-500 bg-blue-50/60 text-slate-900';
            }

            return (
              <div
                key={signal.id}
                onClick={() => toggleSignal(signal.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 shadow-2xs ${borderStyle}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  disabled={hasEvaluated}
                  className="w-4 h-4 rounded text-blue-600 bg-white border-slate-300 focus:ring-0 mt-0.5 cursor-pointer"
                />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold block">{signal.label}</span>
                  {hasEvaluated && (
                    <p className="text-[11px] text-slate-600 leading-normal animate-fade-in">
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
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Check My Selection ({selectedSignalIds.length} selected)</span>
          </button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Feedback Result Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {correctCount === totalCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <span className="text-sm font-semibold text-slate-900">
                    {correctCount === totalCorrect
                      ? 'Correct! All deceptive signals identified.'
                      : `You identified ${correctCount} of ${totalCorrect} key signals.`}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Accuracy: {Math.round((correctCount / totalCorrect) * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {scenario.verdictExplanation}
              </p>
            </div>

            <button
              onClick={handleNextScenario}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <span>Next Scenario</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
