import React, { useState } from 'react';
import {
  Globe,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  AlertCircle,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ThreatResultCard } from '../components/ThreatResultCard';
import { AnalysisScanAnimation } from '../components/AnalysisScanAnimation';
import { LegalModal, LegalDocType } from '../components/LegalModal';
import { CookieConsent } from '../components/CookieConsent';
import { useAuth } from '../context/AuthContext';
import { saveAnalysisRecord } from '../services/firestoreService';
import {
  analyzeThreatInput,
  AnalysisResult,
  AnalysisType
} from '../engine/phishingEngine';

const TAB_CONFIGS: Record<
  AnalysisType,
  {
    title: string;
    description: string;
    placeholder: string;
    samples: { label: string; text: string; badge: string }[];
  }
> = {
  url: {
    title: 'Analyze a Suspicious URL',
    description: 'Inspect website links, shortened destinations, and potential lookalike domain spoofing.',
    placeholder: 'Paste a suspicious URL here (e.g. http://paypal.com@verify-account-portal.xyz/login)...',
    samples: [
      {
        label: 'Brand Subdomain Spoof',
        text: 'http://microsoft.com-security-update.azure-auth.xyz/login/verify?token=9284',
        badge: 'Spoofed Brand'
      },
      {
        label: 'Obfuscated Userinfo (@)',
        text: 'http://chase.com@verify-account-security-alert.net:8080/signin',
        badge: 'Hidden Target'
      },
      {
        label: 'Raw IP Address',
        text: 'http://185.220.101.5/banking/login.php?dest=wire',
        badge: 'Direct IP'
      },
      {
        label: 'Legitimate Portal',
        text: 'https://www.apple.com/support/system-status',
        badge: 'Clean Baseline'
      }
    ]
  },
  email: {
    title: 'Analyze a Suspicious Email',
    description: 'Inspect message bodies, urgency pretexts, credential traps, and fake administrative requests.',
    placeholder: 'Paste the email subject and body text here...',
    samples: [
      {
        label: 'IT Mailbox Expiration',
        text: 'Subject: Mandatory Mailbox Security Upgrade\nFrom: Administrator <admin@company-mail-system.top>\n\nDear Valued Employee,\n\nOur exchange server is migrating. Your mailbox will be deactivated within 1 hour unless you confirm your password and 2FA authenticator token here: http://192.168.1.50/portal/auth',
        badge: 'Credential Trap'
      },
      {
        label: 'Urgent Wire Invoice',
        text: 'Subject: Overdue Invoice Remittance Slip #9021\n\nAttention Accounts Team,\n\nPlease see attached remittance advice. You must wire the outstanding balance of $14,200 via Western Union or wire transfer immediately today to avoid legal collection action.',
        badge: 'Extortion Pretext'
      },
      {
        label: 'Standard Notification',
        text: 'Subject: GitHub Security Advisory Alert\n\nA new security advisory was published for an open-source repository you watch. Visit your notifications dashboard on https://github.com to review details.',
        badge: 'Clean Baseline'
      }
    ]
  },
  message: {
    title: 'Analyze an SMS or Chat Message',
    description: 'Decode short message lures, courier parcel fees, bank alerts, and urgent OTP traps.',
    placeholder: 'Paste the suspicious SMS or instant message text here...',
    samples: [
      {
        label: 'Courier Delivery Fee',
        text: 'USPS Notice: Your package delivery has been put on hold due to missing address details and a $1.85 processing fee. Verify your address and credit card details within 12 hours at https://usps-post-redelivery.com-fees.click to avoid package return.',
        badge: 'Delivery Smishing'
      },
      {
        label: 'Fraud Department Alert',
        text: 'CITI ALERT: A fraudulent transfer of $840.00 was attempted on your debit card. If this was not you, confirm your credentials and card PIN immediately at https://citi-fraud-protection.xyz/resolve or your account will be locked.',
        badge: 'PIN Harvest'
      },
      {
        label: 'Gift Card Request',
        text: 'Hey are you at your desk? I am currently in an executive meeting and cannot take calls. I need you to purchase 4 Apple gift cards for a client presentation urgently. Reply when you see this.',
        badge: 'Executive Impersonation'
      }
    ]
  }
};

export const DecoderPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AnalysisType>('url');
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  // References for strict idempotent analysis lifecycle
  const pendingAnalysisRef = React.useRef<AnalysisResult | null>(null);
  const hasSavedRef = React.useRef<boolean>(false);
  const savedDocIdRef = React.useRef<string | null>(null);

  const currentTabConfig = TAB_CONFIGS[activeTab];
  const isValidInput = inputText.trim().length > 3;

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    setScanResult(null);
    setErrorMsg(null);
    setSaveStatus(null);
    pendingAnalysisRef.current = null;
    hasSavedRef.current = false;
    savedDocIdRef.current = null;
  };

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaveStatus(null);

    if (!inputText.trim()) {
      setErrorMsg(`Please enter a valid ${activeTab.toUpperCase()} or text to begin analysis.`);
      return;
    }

    try {
      // Step 1: Validate input & Run phishing engine ONCE (generates unique analysis ID)
      const result = analyzeThreatInput(inputText, activeTab);
      pendingAnalysisRef.current = result;
      hasSavedRef.current = false;
      savedDocIdRef.current = null;
      setScanResult(null);

      // Step 2: Show scan animation
      setIsScanning(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis could not be initiated.');
    }
  };

  const handleScanAnimationComplete = React.useCallback(async () => {
    const result = pendingAnalysisRef.current;
    if (!result) {
      setIsScanning(false);
      return;
    }

    // Step 3: Scan animation completed
    try {
      // Step 4: Save ONE analysis document idempotently (guarded against re-renders / multi-invocations)
      if (user && !hasSavedRef.current && savedDocIdRef.current !== result.id) {
        hasSavedRef.current = true;
        savedDocIdRef.current = result.id;
        const savedDocId = await saveAnalysisRecord(user.uid, result, user.email || undefined);
        if (savedDocId) {
          setSaveStatus('Saved to your security history');
        }
      }

      // Step 5: Show result to user
      setScanResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis could not be completed.');
    } finally {
      setIsScanning(false);
    }
  }, [user]);

  const handleManualSave = async () => {
    if (!user || !scanResult) return;
    if (saveStatus || savedDocIdRef.current === scanResult.id) {
      // Already saved to security history
      return;
    }

    setSaveStatus('Saving...');
    savedDocIdRef.current = scanResult.id;
    hasSavedRef.current = true;
    const recordId = await saveAnalysisRecord(user.uid, scanResult, user.email || undefined);
    if (recordId) {
      setSaveStatus('Saved to your security history');
    } else {
      setSaveStatus('Unable to save at this time');
    }
  };

  const handleReset = () => {
    setInputText('');
    setScanResult(null);
    setErrorMsg(null);
    setSaveStatus(null);
    pendingAnalysisRef.current = null;
    hasSavedRef.current = false;
    savedDocIdRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Workspace Title & Intro */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Analyze a suspicious item
            </h1>
            <p className="text-sm text-slate-600">
              Paste a URL, email text, or message to inspect explainable threat signals safely.
            </p>
          </div>

          {/* Segmented Vector Tabs (URL | EMAIL | MESSAGE) */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-xl bg-slate-200/70 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('url');
                  setScanResult(null);
                }}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'url'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>URL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('email');
                  setScanResult(null);
                }}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'email'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>EMAIL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('message');
                  setScanResult(null);
                }}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'message'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>MESSAGE</span>
              </button>
            </div>
          </div>

          {/* Clean White Analysis Workspace Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                {currentTabConfig.title}
              </h2>
              <p className="text-xs text-slate-500">
                {currentTabConfig.description}
              </p>
            </div>

            {/* Quick Sample Selector */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-500 block">
                Try a representative sample:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentTabConfig.samples.map(sample => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => handleSelectSample(sample.text)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-2 ${
                      inputText === sample.text
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sample.label}</span>
                    <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {sample.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Input Area */}
            <form onSubmit={handleStartAnalysis} className="space-y-4">
              <div>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setScanResult(null);
                    setErrorMsg(null);
                  }}
                  placeholder={currentTabConfig.placeholder}
                  className="w-full p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {saveStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                  <BookmarkCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{saveStatus}</span>
                </div>
              )}

              {/* Status and Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span>{inputText.length} characters</span>
                  {isValidInput ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready to analyze</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Paste input above</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {inputText && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isScanning || !isValidInput}
                    className="flex-1 sm:flex-initial px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 active:scale-[0.98]"
                  >
                    <Search className="w-4 h-4" />
                    <span>Analyze Threat</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Safe Parser Notice */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero-execution inspection: Target servers and URLs are never contacted</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">Local Heuristic Rules</span>
          </div>

          {/* Scanning Animation Sequence */}
          {isScanning && (
            <div className="py-4">
              <AnalysisScanAnimation
                onComplete={handleScanAnimationComplete}
                targetType={activeTab}
              />
            </div>
          )}

          {/* Results Workspace */}
          {scanResult && !isScanning && (
            <div className="space-y-6 animate-fade-in pt-4">
              <ThreatResultCard
                result={scanResult}
                onReset={handleReset}
                onSaveToHistory={user ? handleManualSave : undefined}
                isSaved={!!saveStatus}
              />
            </div>
          )}
        </div>
      </main>

      <Footer onOpenLegalDoc={(type) => setLegalDoc(type)} />
      <CookieConsent onOpenPrivacyModal={() => setLegalDoc('privacy')} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};
