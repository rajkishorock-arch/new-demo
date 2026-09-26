import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SpotThePhish } from '../components/SpotThePhish';
import { CookieConsent } from '../components/CookieConsent';
import { LegalModal, LegalDocType } from '../components/LegalModal';

const DEFENSIVE_RULES = [
  {
    title: '1. Never Trust In-Line Clickable Links for High-Stakes Actions',
    description: 'When an email or SMS tells you to update credentials, pay an invoice, or unlock an account, never click the provided link. Manually open a browser and type the verified official URL yourself.'
  },
  {
    title: '2. Scrutinize the True Root Domain',
    description: 'Read domain names from right to left starting from the first single slash (/): "paypal.com-verify.account-security.net" is owned by account-security.net, NOT PayPal.'
  },
  {
    title: '3. Authentication Codes (OTPs) Are Confidential Passwords',
    description: 'No legitimate representative, support tech, or bank will ever ask you to state or send an SMS OTP or authenticator code. Anyone asking for an OTP is attempting an active account takeover.'
  },
  {
    title: '4. Be Suspicious of Manufactured Urgency & Threats',
    description: 'Panic is an adversary’s best weapon. Threats of imminent arrest, permanent suspension, or instant penalty fees are engineered to bypass critical reasoning.'
  },
  {
    title: '5. Verify Executive Requests Out-Of-Band',
    description: 'If your manager, CEO, or vendor requests an unexpected wire transfer, gift card purchase, or change of payment details, verify by calling their known phone number or speaking face-to-face.'
  }
];

export const LearnPage: React.FC = () => {
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Security Training
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Spot the Phish
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Train your eye to spot deceptive signals in safe, realistic simulation scenarios
              </p>
            </div>

            <Link
              to="/decoder"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 self-start sm:self-auto"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Launch Decoder</span>
            </Link>
          </div>

          {/* Interactive Spot The Phish Simulation */}
          <div className="space-y-4">
            <SpotThePhish />
          </div>

          {/* Defensive Rules & Best Practices */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Five Rules of Phishing Defense
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core defensive hygiene recommended by cybersecurity practitioners
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {DEFENSIVE_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                >
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-900">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer onOpenLegalDoc={(type) => setLegalDoc(type)} />
      <CookieConsent onOpenPrivacyModal={() => setLegalDoc('privacy')} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};
