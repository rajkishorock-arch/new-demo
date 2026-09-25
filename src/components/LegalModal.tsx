import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-cyber-900 border border-cyber-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-cyber-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            {isPrivacy ? (
              <Shield className="w-5 h-5 text-sky-400" />
            ) : (
              <FileText className="w-5 h-5 text-sky-400" />
            )}
            <h3 id="legal-modal-title" className="text-lg font-bold text-white">
              {isPrivacy ? 'Privacy Policy & Data Ethics' : 'Terms of Service & Safe Usage'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed pr-2">
          {isPrivacy ? (
            <>
              <p className="font-semibold text-sky-300">
                Effective Date: September 2026 | Phishing Decoder Platform
              </p>
              <h4 className="font-bold text-white text-sm">1. Safe Zero-Execution Inspection</h4>
              <p>
                Phishing Decoder evaluates only the text, grammatical structure, and syntax patterns submitted by the user. Our engine does NOT execute submitted links, fetch suspicious external servers, or download remote payloads.
              </p>
              <h4 className="font-bold text-white text-sm">2. Data Minimization & Retention</h4>
              <p>
                We do not collect or store raw passwords, private personal identification numbers, or full sensitive email archives. When an analysis is saved to an authenticated user's account, only truncated preview metadata, score indices, and detected heuristics are persisted.
              </p>
              <h4 className="font-bold text-white text-sm">3. Firebase Cloud Security & Isolation</h4>
              <p>
                All account records are isolated via Cloud Firestore security rules. Transmission occurs strictly over encrypted TLS 1.3 channels. User data is never sold or shared with commercial advertising brokers.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-sky-300">
                Terms of Use | Phishing Decoder Security Analysis
              </p>
              <h4 className="font-bold text-white text-sm">1. Nature of Explainable Rule-Based Analysis</h4>
              <p>
                Phishing Decoder provides educational, explainable heuristic threat evaluations to assist users in identifying suspicious patterns. The tool does not guarantee 100% certainty and should be utilized as a defensive decision aid alongside standard cybersecurity hygiene.
              </p>
              <h4 className="font-bold text-white text-sm">2. Permitted Defensive Usage</h4>
              <p>
                Users agree to utilize Phishing Decoder solely for legitimate defensive analysis, security training, and incident triage. Reverse engineering or attempting to weaponize analysis signatures for evading security filters is strictly prohibited.
              </p>
              <h4 className="font-bold text-white text-sm">3. Independent Verification</h4>
              <p>
                Users remain responsible for their actions. Always confirm financial or critical account notices through verified, independent out-of-band communication before taking action.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-cyber-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-xs"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
