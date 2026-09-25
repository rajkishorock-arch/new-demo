import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { openCookiePreferences } from './CookieConsent';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onOpenLegalDoc?: (type: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegalDoc }) => {
  return (
    <footer className="bg-cyber-950 text-slate-400 text-xs sm:text-sm py-12 sm:py-16 border-t border-cyber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-cyber-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-cyan-600 text-white rounded-xl shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white font-mono tracking-tight">
                PHISHING<span className="text-sky-400">DECODER</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Decode the threat. Understand the signal. Know what to do. Explainable rule-based cybersecurity analysis for suspicious URLs, phishing emails, and smishing messages.
            </p>

            <div className="p-3 bg-cyber-900/80 border border-cyber-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <span className="text-sky-400 font-bold uppercase tracking-wider block">
                Engineering Transparency:
              </span>
              <p>
                Rule-based threat assessment & explainable heuristic inspection. We do not claim external global threat intelligence feeds or real AI models unless explicitly connected.
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/decoder" className="hover:text-white transition-colors">
                  Threat Decoder Studio
                </Link>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  URL Intelligence
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Message Analysis
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-white transition-colors">
                  Interactive Demo
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Security Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Architecture */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Security
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#signals" className="hover:text-white transition-colors">
                  Signals Showcase
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-white transition-colors">
                  Safe Inspection Workflow
                </a>
              </li>
              <li>
                <Link to="/learn" className="hover:text-white transition-colors">
                  Spot the Phish Lab
                </Link>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-cyber-900 text-sky-400 rounded-lg text-[11px] font-semibold border border-cyber-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero-Execution Sandbox</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Governance & Privacy */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Governance & Privacy
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="hover:text-white transition-colors text-left font-medium text-sky-400"
                >
                  Cookie Preferences
                </button>
              </li>
              <li className="pt-1 text-[11px] text-slate-500">
                Data minimized: No sensitive credentials stored.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Phishing Decoder. Built with explainable security heuristics.</p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>TLS 1.3 Firebase Encrypted</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
