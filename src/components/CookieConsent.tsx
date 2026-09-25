import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Check } from 'lucide-react';

const STORAGE_KEY = 'phishing_decoder_cookie_consent';

export type ConsentStatus = 'accepted' | 'rejected' | null;

export const openCookiePreferences = () => {
  window.dispatchEvent(new CustomEvent('phishing_decoder_open_cookies'));
};

interface CookieConsentProps {
  onOpenPrivacyModal?: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenPrivacyModal }) => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Preference switches
  const [essential] = useState(true); // Always true
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ConsentStatus;
    if (saved) {
      setConsentStatus(saved);
      setIsVisible(false);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleReopen = () => {
      setShowPreferencesModal(true);
    };

    window.addEventListener('phishing_decoder_open_cookies', handleReopen);
    return () => {
      window.removeEventListener('phishing_decoder_open_cookies', handleReopen);
    };
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsentStatus('accepted');
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setConsentStatus('rejected');
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleSaveCustomPreferences = () => {
    localStorage.setItem(STORAGE_KEY, analytics ? 'accepted' : 'rejected');
    setConsentStatus(analytics ? 'accepted' : 'rejected');
    setShowPreferencesModal(false);
    setIsVisible(false);
  };

  return (
    <>
      {/* Floating Bottom Cookie Banner */}
      {isVisible && !showPreferencesModal && (
        <aside
          role="region"
          aria-label="Cookie Consent Notice"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-cyber-900 border border-cyber-700 rounded-2xl shadow-2xl p-5 animate-slide-up text-slate-100 backdrop-blur-md"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-sky-950 border border-sky-800 text-sky-400 rounded-xl shrink-0">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Privacy & Cookie Preferences
                </span>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                  aria-label="Close banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Phishing Decoder prioritizes your privacy. We use local storage solely for session security and your analysis workflow preferences. We do not track you across the web.
              </p>

              <div className="pt-1 flex items-center space-x-3 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(true)}
                  className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
                >
                  Cookie Settings
                </button>
                {onOpenPrivacyModal && (
                  <button
                    type="button"
                    onClick={onOpenPrivacyModal}
                    className="text-slate-400 hover:text-white font-medium"
                  >
                    Privacy Policy
                  </button>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="flex-1 px-3 py-2 bg-cyber-800 hover:bg-cyber-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors text-center"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors text-center"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Detailed Cookie Preferences Modal */}
      {showPreferencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-cyber-900 border border-cyber-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-sky-400" />
                <h3 id="cookie-modal-title" className="text-base font-bold text-white">
                  Cookie & Privacy Preferences
                </h3>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close Preferences Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Customize how Phishing Decoder uses local storage on your device. Essential session cookies cannot be disabled as they are required for Firebase authentication and secure operational persistence.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              {/* Essential */}
              <div className="p-3.5 bg-cyber-950 border border-cyber-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">Essential Authentication</span>
                    <span className="text-[10px] px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-800 rounded font-semibold">
                      Required
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Maintains Firebase Auth token and role-based session isolation.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={essential}
                  disabled
                  className="w-4 h-4 text-sky-600 rounded cursor-not-allowed bg-cyber-900 border-cyber-700"
                />
              </div>

              {/* Functional */}
              <div className="p-3.5 bg-cyber-950 border border-cyber-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">UI Workspace Preferences</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Remembers active analysis tab (URL, Email, SMS) and view preferences.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded cursor-pointer bg-cyber-900 border-cyber-700"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-cyber-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-cyber-800 rounded-xl transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleSaveCustomPreferences}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
