import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { openCookiePreferences } from './CookieConsent';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onOpenLegalDoc?: (type: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegalDoc }) => {
  return (
    <footer className="bg-slate-100/80 text-slate-600 text-xs sm:text-sm py-12 sm:py-16 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-200">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center space-x-2.5">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Phishing <span className="text-blue-600">Decoder</span>
              </span>
            </Link>

            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Decode the threat. Understand the signal. Know what to do. Explainable rule-based cybersecurity analysis for suspicious URLs, phishing emails, and smishing messages.
            </p>

            <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-0.5 shadow-2xs">
              <span className="text-blue-600 font-semibold uppercase tracking-wider block">
                Zero-Execution Safety:
              </span>
              <p className="text-slate-500">
                Our engine inspects string syntax and heuristic markers locally. It never executes code, visits target servers, or clicks submitted links.
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Product & Info
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/decoder" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Threat Decoder
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Spot the Phish
                </Link>
              </li>
              <li>
                <a href="/#about" className="text-slate-600 hover:text-slate-900 transition-colors">
                  About Platform
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Contact Team
                </a>
              </li>
            </ul>
          </div>

          {/* Safety & Learning */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Safety & Learning
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/learn" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Defense Rules
                </Link>
              </li>
              <li>
                <Link to="/decoder" className="text-slate-600 hover:text-slate-900 transition-colors">
                  URL Inspection
                </Link>
              </li>
              <li>
                <Link to="/decoder" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Email Inspection
                </Link>
              </li>
              <li>
                <Link to="/decoder" className="text-slate-600 hover:text-slate-900 transition-colors">
                  SMS / Message Inspection
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Privacy */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Privacy & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('privacy')}
                  className="text-slate-600 hover:text-slate-900 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('terms')}
                  className="text-slate-600 hover:text-slate-900 transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="hover:text-blue-700 transition-colors text-left font-medium text-blue-600"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Phishing Decoder. Explainable cybersecurity heuristics.</p>
          <div className="flex items-center space-x-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Firebase Authentication</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
