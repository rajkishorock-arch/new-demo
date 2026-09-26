import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Globe,
  Mail,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Loader2,
  Lock,
  FileCheck,
  Quote,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { InteractiveHeroShowcase } from '../components/InteractiveHeroShowcase';
import { SpotThePhish } from '../components/SpotThePhish';
import { CookieConsent } from '../components/CookieConsent';
import { LegalModal, LegalDocType } from '../components/LegalModal';
import { createContactMessage } from '../services/firestoreService';

export const HomePage: React.FC = () => {
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    setContactSuccess(null);

    if (!contactName.trim()) {
      setContactError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      setContactError('Please provide a valid email address.');
      return;
    }

    if (contactMessage.trim().length < 10) {
      setContactError('Message must be at least 10 characters long.');
      return;
    }

    setContactSubmitting(true);
    try {
      const msgId = await createContactMessage(
        contactName,
        contactEmail,
        contactMessage,
        contactSubject
      );

      if (msgId) {
        setContactSuccess('Your message has been sent successfully. An administrator will review your inquiry.');
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else {
        setContactError('Failed to send message. Please verify your connection and try again.');
      }
    } catch (err: any) {
      setContactError(err.message || 'Unable to submit your inquiry at this time.');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1">
        {/* =======================================================
            SECTION 1: HERO
        ======================================================= */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Value Proposition Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Explainable Phishing Analysis</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Decode the threat. <br className="hidden sm:inline" />
                <span className="text-blue-600">Understand the signal.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Analyze suspicious URLs, emails, and messages to see exactly why something looks dangerous before you click, reply, or enter credentials.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/decoder"
                  className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 group"
                >
                  <Search className="w-4 h-4" />
                  <span>Analyze a Threat</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <span>See How It Works</span>
                </a>
              </div>
            </div>

            {/* Interactive Hero Showcase */}
            <InteractiveHeroShowcase />
          </div>
        </section>

        {/* =======================================================
            SECTION 2: HOW IT WORKS (INPUT -> ANALYZE -> UNDERSTAND -> ACT)
        ======================================================= */}
        <section id="how-it-works" className="py-16 sm:py-24 border-b border-slate-200 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Inspection Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                How Phishing Decoder Works
              </h2>
              <p className="text-sm text-slate-600">
                A 4-step explainable pipeline that transforms raw suspicion into clear defensive clarity without executing harmful code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1: INPUT */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 relative">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-100">
                  1
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Phase: INPUT</div>
                <h3 className="text-base font-bold text-slate-900">Provide Suspicious Payload</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paste any suspicious website link, phishing email headers/body, or courier smishing text. The system parses syntactic structure safely.
                </p>
              </div>

              {/* Step 2: ANALYZE */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 relative">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm border border-amber-100">
                  2
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Phase: ANALYZE</div>
                <h3 className="text-base font-bold text-slate-900">Zero-Execution Sandbox</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deterministic heuristics scan for urgency pretexts, brand domain mimicry, Punycode homographs, and credential harvesting patterns.
                </p>
              </div>

              {/* Step 3: UNDERSTAND */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 relative">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm border border-rose-100">
                  3
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Phase: UNDERSTAND</div>
                <h3 className="text-base font-bold text-slate-900">Explainable Threat Score</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review the 0–100 threat score, an executive summary explaining "Why this result?", and highlighted evidence phrases in the input.
                </p>
              </div>

              {/* Step 4: ACT */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100">
                  4
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Phase: ACT</div>
                <h3 className="text-base font-bold text-slate-900">Defensive Directives</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Receive a prioritized action checklist: whether to report to your security team, verify out-of-band, or rotate compromised passwords.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION 3: ABOUT PHISHING DECODER
        ======================================================= */}
        <section id="about" className="py-16 sm:py-24 border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                About the Platform
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explainable Cybersecurity Built on Transparent Rules
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Phishing Decoder was created to solve the fundamental gap in modern cybersecurity awareness: opaque security tools that tell you something is dangerous without ever explaining why.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: What It Is */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">What Phishing Decoder Is</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  An interactive threat-analysis studio engineered to decode suspicious URLs, corporate phishing pretexts, and smishing texts into transparent, actionable signals.
                </p>
              </div>

              {/* Card 2: Why Phishing Is Hard */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Why Phishing Deceives Us</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Modern social engineering weaponizes cognitive biases: artificial time limits, executive impersonation, and deceptive subdomain structures designed to deceive our intuition.
                </p>
              </div>

              {/* Card 3: Safe Analysis Philosophy */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Zero-Execution Philosophy</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our heuristics analyze raw syntax patterns locally in your browser. Target servers are <strong>never contacted</strong>, malicious scripts are never triggered, and links are never opened.
                </p>
              </div>

              {/* Card 4: Explainable Heuristics */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Deterministic Heuristics</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We don't rely on uninterpretable black-box models. Every risk finding cites concrete evidence: exact subdomain counts, matching trigger keywords, and obfuscated ports.
                </p>
              </div>

              {/* Card 5: Real-World Coverage */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl w-fit">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Comprehensive Threat Vectors</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Covers web links (Punycode, lookalikes, userinfo traps), urgent corporate emails (payroll, IT migrations), and mobile SMS lures (delivery fees, bank PIN traps).
                </p>
              </div>

              {/* Card 6: What We Do NOT Do */}
              <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl w-fit">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-rose-950">What The Tool Does NOT Do</h3>
                <p className="text-xs text-rose-800 leading-relaxed">
                  We do not execute malware payloads, act as an intrusive proxy, or store private passwords or credentials. Our analysis is strictly safe and educational.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION 4: SPOT THE PHISH INTERACTIVE TRAINING
        ======================================================= */}
        <section className="py-16 sm:py-24 border-b border-slate-200 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Hands-On Security Simulation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Test Your Instincts: Spot the Phish
              </h2>
              <p className="text-sm text-slate-600">
                Sharpen your eye with realistic scenarios. Can you tell legitimate corporate communications from deceptive phishing campaigns?
              </p>
            </div>

            <SpotThePhish />
          </div>
        </section>

        {/* =======================================================
            SECTION 5: TESTIMONIALS (SECURITY AWARENESS FEEDBACK)
        ======================================================= */}
        <section className="py-16 sm:py-24 border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                User Feedback & Case Studies
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Demo User & Security Exercise Feedback
              </h2>
              <p className="text-sm text-slate-600">
                Feedback collected during security awareness training sessions and threat evaluation walkthroughs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className="text-sm">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "I used to believe lookalike domains were easy to identify until I saw how attackers chain multiple subdomains like 'microsoft.com-update.azure-auth.xyz'. Phishing Decoder broke down the host labels clearly."
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    ST
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Security Awareness Participant</h4>
                    <p className="text-[11px] text-slate-500">IT Trainee • Demo Feedback</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className="text-sm">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "The smishing decoder flagged a real package delivery SMS I received claiming a $1.85 fee. It highlighted the fake courier domain and urgency pressure within two seconds."
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                    DA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Student Security Analyst</h4>
                    <p className="text-[11px] text-slate-500">GEC Khagaria Student Demo</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className="text-sm">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "What makes this tool unique is the 'What should you do?' checklist. It doesn't leave you stranded with technical jargon; it gives clear, prioritized defensive steps."
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    EM
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Demo User Exercise</h4>
                    <p className="text-[11px] text-slate-500">Security Workshop Evaluator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION 6: CONTACT US / REAL FIRESTORE FORM
        ======================================================= */}
        <section id="contact" className="py-16 sm:py-24 border-b border-slate-200 bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Direct Communication
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Contact the Security Team
              </h2>
              <p className="text-sm text-slate-600">
                Have questions about our heuristic engine or need support with a threat inspection? Send a message directly to our admin team.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
              {contactSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">Message Received</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    {contactSuccess}
                  </p>
                  <button
                    onClick={() => setContactSuccess(null)}
                    className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {contactError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Alex Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g. alex@institution.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Threat Detection Feedback">Threat Detection Feedback</option>
                      <option value="Educational Workshop">Educational Workshop / Demonstration</option>
                      <option value="Bug Report">Technical Issue / Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Please describe your question or inquiry in detail..."
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Submissions are securely stored in Firestore and delivered to administrators</span>
                    </span>

                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      {contactSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION 7: BOTTOM CALL TO ACTION
        ======================================================= */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Have a suspicious link or message right now?
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                Paste it into Phishing Decoder. In under two seconds, see all detected threat signals, learn why they matter, and know what to do next.
              </p>
              <div className="pt-2">
                <Link
                  to="/decoder"
                  className="inline-flex items-center space-x-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Launch Threat Decoder</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenLegalDoc={(type) => setLegalDoc(type)} />
      <CookieConsent onOpenPrivacyModal={() => setLegalDoc('privacy')} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};
