import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  ArrowRight,
  Lock,
  Globe,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  FileCode,
  Eye,
  KeyRound,
  DollarSign,
  Clock,
  UserX
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SectionHeading } from '../components/SectionHeading';
import { CapabilityCard, CapabilityItem } from '../components/CapabilityCard';
import { ProcessSteps } from '../components/ProcessSteps';
import { SpotThePhish } from '../components/SpotThePhish';
import { CTASection } from '../components/CTASection';
import { CookieConsent } from '../components/CookieConsent';
import { LegalModal, LegalDocType } from '../components/LegalModal';
import { ThreatResultCard } from '../components/ThreatResultCard';
import { AnalysisScanAnimation } from '../components/AnalysisScanAnimation';
import {
  analyzeThreatInput,
  AnalysisResult,
  AnalysisType
} from '../engine/phishingEngine';

const SAMPLE_DEMOS = [
  {
    label: 'Suspicious Bank URL',
    type: 'url' as AnalysisType,
    text: 'http://paypal.com@verify-account-security-alert.xyz/webscr/login?redirect=token_49',
    badge: 'Deceptive Link'
  },
  {
    label: 'Urgent IT Mail',
    type: 'email' as AnalysisType,
    text: 'URGENT: Corporate Mailbox Migration. Your mailbox will be terminated within 2 hours. Enter your login password and 2FA code here to verify identity: http://192.168.1.105/auth',
    badge: 'Credential Harvest'
  },
  {
    label: 'Courier Smishing SMS',
    type: 'message' as AnalysisType,
    text: 'DHL Express Alert: Your package delivery has been put on hold due to an unpaid tax of $2.40. Settle balance immediately at https://dhl-parcel-tracking.com-support.click to avoid package forfeiture.',
    badge: 'Urgency & Payment'
  },
  {
    label: 'Legitimate Website',
    type: 'url' as AnalysisType,
    text: 'https://docs.github.com/en/get-started/quickstart/hello-world',
    badge: 'Standard Protocol'
  }
];

const SIGNALS_SHOWCASE = [
  {
    id: 'subdomains',
    title: 'Excessive Subdomain Nesting',
    category: 'URL Structural Deception',
    severity: 'HIGH RISK',
    example: 'https://paypal.com.account-update.auth.security-alert-node.xyz/login',
    summary: 'Attackers create dozens of subdomain prefixes to push the real domain off-screen on smartphones.',
    howToSpot: 'Read hostnames from right to left! Find the first single slash (/), then look at the two words immediately before it. That is the actual owner.'
  },
  {
    id: 'urgency-pressure',
    title: 'Artificial Urgency & Severe Consequences',
    category: 'Psychological Social Engineering',
    severity: 'HIGH RISK',
    example: '"Action required within 15 minutes or your account will be permanently suspended."',
    summary: 'Phishers induce artificial panic so victims make snap decisions before verifying legitimacy.',
    howToSpot: 'Notice arbitrary deadlines and emotional threats. Genuine enterprises give reasonable notice through verified official channels.'
  },
  {
    id: 'homograph-punycode',
    title: 'IDN Homograph & Punycode (xn--) Spoofing',
    category: 'Character Mimicry',
    severity: 'CRITICAL',
    example: 'https://www.apple.com (with Cyrillic "а" instead of Latin "a" -> xn--pple-43d.com)',
    summary: 'Visually identical characters from foreign alphabets register as completely different internet destinations.',
    howToSpot: 'Our explainable engine decodes "xn--" Punycode prefixes and alerts you to internationalized homograph tricks.'
  },
  {
    id: 'credential-harvest',
    title: 'Direct Password, PIN & OTP Requests',
    category: 'Credential Harvesting',
    severity: 'CRITICAL',
    example: '"Reply with your one-time verification passcode to confirm your identity."',
    summary: 'Attackers trick targets into handing over two-factor authentication tokens in real time.',
    howToSpot: 'Never share OTPs, passcodes, or credentials via messages. Official services state explicitly that staff will never request them.'
  }
];

export const HomePage: React.FC = () => {
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);
  const [demoInput, setDemoInput] = useState(SAMPLE_DEMOS[0].text);
  const [demoType, setDemoType] = useState<AnalysisType>(SAMPLE_DEMOS[0].type);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AnalysisResult | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(SIGNALS_SHOWCASE[0].id);

  const navigate = useNavigate();

  const handleSelectSample = (sample: typeof SAMPLE_DEMOS[0]) => {
    setDemoInput(sample.text);
    setDemoType(sample.type);
    setScanResult(null);
    setDemoError(null);
  };

  const handleRunDemoScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDemoError(null);

    if (!demoInput.trim()) {
      setDemoError('Please enter a URL or message to analyze.');
      return;
    }

    setIsScanning(true);
  };

  const handleScanAnimationComplete = () => {
    try {
      const result = analyzeThreatInput(demoInput, demoType);
      setScanResult(result);
    } catch (err: any) {
      setDemoError(err.message || 'Unable to analyze input.');
    } finally {
      setIsScanning(false);
    }
  };

  const capabilities: CapabilityItem[] = [
    {
      id: 'url-intel',
      icon: Globe,
      title: 'URL Intelligence',
      badge: 'STRUCTURAL SCAN',
      whatItDoes: 'Parses domain depth, Punycode tricks, port anomalies, userinfo obfuscation (@), and known shortened redirects.',
      whyItMatters: 'Over 85% of malicious campaigns leverage deceptive URL structures designed to spoof legitimate corporate identities.',
      actionText: 'Inspect URL Threat',
      actionHref: '/decoder'
    },
    {
      id: 'msg-analysis',
      icon: Mail,
      title: 'Message Analysis',
      badge: 'SOCIAL HEURISTICS',
      whatItDoes: 'Identifies urgency deadlines, coercive intimidation, generic salutations, and suspicious file attachment references in email and SMS.',
      whyItMatters: 'Social engineering targets human psychology—fear and urgency—to bypass standard technical defenses.',
      actionText: 'Analyze Message',
      actionHref: '/decoder'
    },
    {
      id: 'explainable-risk',
      icon: ShieldAlert,
      title: 'Explainable Risk',
      badge: '0-100 INDEX',
      whatItDoes: 'Calculates a deterministic risk index paired with an intuitive "Why This Result?" breakdown and transparent evidence tagging.',
      whyItMatters: 'Black-box alerts cause alert fatigue. Users make better security choices when they understand the exact signals detected.',
      actionText: 'View Heuristics',
      actionHref: '/decoder'
    },
    {
      id: 'action-guidance',
      icon: ShieldCheck,
      title: 'Action Guidance',
      badge: 'WHAT SHOULD YOU DO?',
      whatItDoes: 'Generates prioritized, numbered defensive directives tailored to the specific threat severity and vectors identified.',
      whyItMatters: 'Detecting phishing is only half the battle; knowing immediate defensive actions prevents credential loss and financial compromise.',
      actionText: 'Explore Defense',
      actionHref: '/decoder'
    }
  ];

  return (
    <div className="min-h-screen bg-cyber-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar />

      <main className="flex-1">
        {/* =======================================================
            SECTION A: HERO SECTION
        ======================================================= */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-cyber-900">
          {/* Subtle Cyber Glow Orbs */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* Product Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyber-900 border border-cyber-700 text-sky-400 text-xs font-mono font-semibold uppercase tracking-wider shadow-glow-cyan animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>Explainable Rule-Based Security Engine</span>
              </div>

              {/* Product Title & Tagline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] font-sans">
                PHISHING <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-200">DECODER</span>
              </h1>

              <p className="text-xl sm:text-2xl font-bold text-sky-300 tracking-tight">
                "Decode the threat. Understand the signal. Know what to do."
              </p>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Analyze suspicious links, emails and messages to uncover phishing signals, understand the evidence, and take the right next step.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  to="/decoder"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-glow-cyan transition-all flex items-center justify-center space-x-2 group"
                >
                  <Search className="w-4 h-4" />
                  <span>Analyze a Threat</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#workflow"
                  className="w-full sm:w-auto px-6 py-3.5 bg-cyber-900 hover:bg-cyber-850 border border-cyber-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Hero Security Flow Graphic: Input -> Scanning -> Signals -> Risk -> Action */}
              <div className="pt-12 max-w-4xl mx-auto">
                <div className="p-5 sm:p-7 bg-cyber-900/90 border border-cyber-700/80 rounded-2xl shadow-2xl backdrop-blur-md">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider text-left mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-sky-400" />
                      <span>Security Inspection Pipeline Architecture</span>
                    </span>
                    <span className="text-emerald-400 font-bold">100% Zero-Execution Safe</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    {/* Stage 1 */}
                    <div className="p-3 bg-cyber-950 border border-cyber-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 block">STAGE 1</span>
                      <p className="text-xs font-bold text-white">INPUT</p>
                      <span className="text-[11px] text-slate-400 block truncate">URL / Mail / SMS</span>
                    </div>

                    {/* Stage 2 */}
                    <div className="p-3 bg-cyber-950 border border-cyber-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 block">STAGE 2</span>
                      <p className="text-xs font-bold text-sky-400">SCANNING</p>
                      <span className="text-[11px] text-slate-400 block truncate">Grammar & Syntax</span>
                    </div>

                    {/* Stage 3 */}
                    <div className="p-3 bg-cyber-950 border border-cyber-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 block">STAGE 3</span>
                      <p className="text-xs font-bold text-amber-400">SIGNALS</p>
                      <span className="text-[11px] text-slate-400 block truncate">Brand / Urgency</span>
                    </div>

                    {/* Stage 4 */}
                    <div className="p-3 bg-cyber-950 border border-cyber-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 block">STAGE 4</span>
                      <p className="text-xs font-bold text-rose-400">RISK</p>
                      <span className="text-[11px] text-slate-400 block truncate">0-100 Score</span>
                    </div>

                    {/* Stage 5 */}
                    <div className="col-span-2 sm:col-span-1 p-3 bg-sky-950/60 border border-sky-600/40 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-sky-400 block">STAGE 5</span>
                      <p className="text-xs font-bold text-emerald-400">ACTION</p>
                      <span className="text-[11px] text-sky-200 block truncate">Defensive Steps</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION B: PROBLEM / VALUE PROPOSITION
        ======================================================= */}
        <section className="py-16 sm:py-24 bg-cyber-950 border-b border-cyber-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Attack Vector Anatomy"
              title="Modern Phishing Relies on Subtle Human & Technical Deceptions"
              description="Attackers exploit psychological pressure and deceptive web syntax to trick normal users. Phishing Decoder dissects each deceptive layer."
            />

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1 */}
              <div className="p-5 bg-cyber-900/80 border border-cyber-800 rounded-2xl space-y-2 hover:border-cyber-700 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Manufactured Urgency</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  "Account suspended in 10 minutes." Artificial deadlines impair rational scrutiny.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-5 bg-cyber-900/80 border border-cyber-800 rounded-2xl space-y-2 hover:border-cyber-700 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center">
                  <UserX className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Brand Impersonation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trademarks (PayPal, Microsoft, Banks) cloned inside fraudulent third-party domains.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-5 bg-cyber-900/80 border border-cyber-800 rounded-2xl space-y-2 hover:border-cyber-700 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Deceptive Web Links</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Excessive subdomains, Punycode homographs, and userinfo @ symbols masking destinations.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-5 bg-cyber-900/80 border border-cyber-800 rounded-2xl space-y-2 hover:border-cyber-700 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-orange-950/60 border border-orange-800/60 text-orange-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Credential Harvesting</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Demands for passwords, security PINs, or one-time authenticator codes under false pretexts.
                </p>
              </div>

              {/* Card 5 */}
              <div className="p-5 bg-cyber-900/80 border border-cyber-800 rounded-2xl space-y-2 hover:border-cyber-700 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Social Engineering</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pretexting executive authority, fake delivery unpaid fees, or fake tax refunds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION C: CORE CAPABILITIES
        ======================================================= */}
        <section id="capabilities" className="py-16 sm:py-24 bg-cyber-900/40 border-b border-cyber-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Explainable Defense"
              title="Four Foundational Threat Intelligence Modules"
              description="Engineered to provide immediate clarity on whether a digital artifact is safe, suspicious, or dangerous."
            />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {capabilities.map(cap => (
                <CapabilityCard key={cap.id} item={cap} />
              ))}
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION D: HOW IT WORKS (PASTE -> ANALYZE -> UNDERSTAND -> ACT)
        ======================================================= */}
        <section id="workflow" className="py-16 sm:py-24 bg-cyber-950 border-b border-cyber-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Deterministic Workflow"
              title="From Suspicion to Action in Four Clear Steps"
              description="A transparent security pipeline designed for normal users. No technical jargon, no black boxes."
            />

            <div className="mt-12">
              <ProcessSteps />
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION E: INTERACTIVE LIVE DEMO (Runs local engine!)
        ======================================================= */}
        <section id="demo" className="py-16 sm:py-24 bg-cyber-900/30 border-b border-cyber-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Live Engine Sandbox"
              title="Test the Heuristic Engine Right Now"
              description="Select one of the sample threats below or paste your own suspicious text. The real explainable rule engine evaluates it locally in your browser."
            />

            {/* Demo Input Card */}
            <div className="mt-10 bg-cyber-900 border border-cyber-700/90 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Sample Chips */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  Click a Sample to Pre-Fill:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_DEMOS.map(sample => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 ${
                        demoInput === sample.text
                          ? 'bg-sky-600 border-sky-400 text-white shadow-xs'
                          : 'bg-cyber-950 border-cyber-800 text-slate-300 hover:border-cyber-700 hover:text-white'
                      }`}
                    >
                      <span>{sample.label}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-cyber-900 px-1.5 py-0.5 rounded">
                        {sample.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleRunDemoScan} className="space-y-4">
                <div className="relative">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-200">
                      Input to Analyze ({demoType.toUpperCase()}):
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setDemoType('url')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          demoType === 'url' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'text-slate-500'
                        }`}
                      >
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setDemoType('email')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          demoType === 'email' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'text-slate-500'
                        }`}
                      >
                        EMAIL
                      </button>
                      <button
                        type="button"
                        onClick={() => setDemoType('message')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          demoType === 'message' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'text-slate-500'
                        }`}
                      >
                        SMS
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={demoInput}
                    onChange={(e) => {
                      setDemoInput(e.target.value);
                      setScanResult(null);
                    }}
                    placeholder="Paste a suspicious URL, email snippet, or smishing message..."
                    className="w-full p-4 rounded-xl bg-cyber-950 border border-cyber-700 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                {demoError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                    <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{demoError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Safe local parse: No external HTTP requests are made</span>
                  </span>

                  <button
                    type="submit"
                    disabled={isScanning || !demoInput.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Run Explainable Threat Scan</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Scan Progress Sequence */}
            {isScanning && (
              <div className="mt-8">
                <AnalysisScanAnimation
                  onComplete={handleScanAnimationComplete}
                  targetType={demoType}
                />
              </div>
            )}

            {/* Threat Report Result */}
            {scanResult && !isScanning && (
              <div className="mt-8">
                <ThreatResultCard
                  result={scanResult}
                  onReset={() => {
                    setScanResult(null);
                    setDemoInput('');
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* =======================================================
            SECTION F: SECURITY SIGNALS SHOWCASE
        ======================================================= */}
        <section id="signals" className="py-16 sm:py-24 bg-cyber-950 border-b border-cyber-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Threat Signal Taxonomy"
              title="Key Deceptive Signals Decoded by Our Engine"
              description="Learn how modern attackers engineer deceptive elements and how our explainable heuristics catch them."
            />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              {SIGNALS_SHOWCASE.map(sig => {
                const isExpanded = expandedSignalId === sig.id;

                return (
                  <div
                    key={sig.id}
                    className="bg-cyber-900/80 border border-cyber-800 rounded-2xl p-5 sm:p-6 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono uppercase bg-cyber-950 border border-cyber-800 text-sky-400 px-2 py-0.5 rounded font-bold">
                            {sig.category}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            sig.severity === 'CRITICAL' ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60' : 'bg-orange-950/60 text-orange-300 border border-orange-800/60'
                          }`}>
                            {sig.severity}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1.5">
                          {sig.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => setExpandedSignalId(isExpanded ? null : sig.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                        aria-label="Toggle signal explanation"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="p-3 bg-cyber-950/90 rounded-xl border border-cyber-850 font-mono text-xs text-amber-200/90 break-all">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Example Pattern:</span>
                      {sig.example}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {sig.summary}
                    </p>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-cyber-800 animate-fade-in text-xs space-y-1">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block">
                          How to Spot & Defend:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {sig.howToSpot}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION G: SPOT THE PHISH (Awareness / Learn Section)
        ======================================================= */}
        <section id="learn-preview" className="py-16 sm:py-24 bg-cyber-900/40 border-b border-cyber-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Gamified Awareness"
              title="Spot the Phish: Interactive Learning Lab"
              description="Put your detection skills to the test. Review a realistic simulation and pinpoint all deceptive indicators before seeing the expert breakdown."
            />

            <div className="mt-10">
              <SpotThePhish />
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION H: FINAL CTA SECTION
        ======================================================= */}
        <CTASection />
      </main>

      <Footer onOpenLegalDoc={(type) => setLegalDoc(type)} />
      <CookieConsent onOpenPrivacyModal={() => setLegalDoc('privacy')} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};
