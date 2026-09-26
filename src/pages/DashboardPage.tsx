import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  History,
  ChevronRight,
  Loader2,
  X,
  Eye,
  Trash2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StatusBadge } from '../components/StatusBadge';
import { ThreatResultCard } from '../components/ThreatResultCard';
import { CookieConsent } from '../components/CookieConsent';
import { LegalModal, LegalDocType } from '../components/LegalModal';
import { useAuth } from '../context/AuthContext';
import {
  getUserAnalyses,
  subscribeToUserAnalyses,
  deleteAnalysisRecord,
  StoredAnalysisRecord
} from '../services/firestoreService';
import { AnalysisResult } from '../engine/phishingEngine';
import { AlertCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [analyses, setAnalyses] = useState<StoredAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<StoredAnalysisRecord | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(
    (location.state as any)?.accessDeniedNotice || null
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = subscribeToUserAnalyses(
      user.uid,
      (records) => {
        const seenSignatures = new Set<string>();
        const uniqueRecords: StoredAnalysisRecord[] = [];

        for (const record of records) {
          const signature = `${record.type}|${record.inputSummary.trim()}|${record.riskScore}`;
          if (!seenSignatures.has(record.id) && !seenSignatures.has(signature)) {
            seenSignatures.add(record.id);
            seenSignatures.add(signature);
            uniqueRecords.push(record);
          }
        }

        setAnalyses(uniqueRecords);
        setLoading(false);
      },
      (err) => {
        console.error('[Dashboard] Real-time stream error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (window.confirm('Delete this analysis record from your history?')) {
      const ok = await deleteAnalysisRecord(user.uid, recordId);
      if (ok) {
        setAnalyses(prev => prev.filter(a => a.id !== recordId));
        if (selectedRecord?.id === recordId) {
          setSelectedRecord(null);
        }
      }
    }
  };

  const renderModalReport = (record: StoredAnalysisRecord): AnalysisResult => {
    return {
      id: record.id,
      type: record.type,
      inputRaw: record.inputSummary,
      inputSummary: record.inputSummary,
      riskScore: record.riskScore,
      riskLevel: record.riskLevel,
      summaryWhy: record.summaryWhy,
      findings: record.fullReportSnapshot?.findings || [],
      evidenceMap: record.fullReportSnapshot?.evidenceMap || {
        parsedType: record.type,
        primarySubject: record.inputSummary,
        components: { Type: record.type.toUpperCase() },
        flaggedPhrases: []
      },
      recommendations: record.recommendations,
      inspectedAt: record.createdAt?.toDate ? record.createdAt.toDate().toISOString() : new Date().toISOString(),
      engineVersion: record.fullReportSnapshot?.engineVersion || 'Explainable Rule Engine v2.4'
    };
  };

  // Stats calculation directly from canonical analyses collection
  const liveHighRisk = analyses.filter(a => a.riskLevel === 'HIGH RISK').length;
  const liveSuspicious = analyses.filter(a => a.riskLevel === 'SUSPICIOUS').length;
  const liveLowRisk = analyses.filter(a => a.riskLevel === 'LOW' || a.riskLevel === 'CAUTION').length;

  const totalAnalyses = analyses.length;
  const highRiskCount = liveHighRisk;
  const suspiciousCount = liveSuspicious;
  const lowRiskCount = liveLowRisk;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Personal Overview
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Analyst'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Overview of your analyzed threats and safe inspection history
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/decoder"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Analyze Threat</span>
              </Link>
              <Link
                to="/history"
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-2"
              >
                <History className="w-3.5 h-3.5" />
                <span>Full Archive</span>
              </Link>
            </div>
          </div>

          {accessDeniedMessage && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">{accessDeniedMessage}</span>
              </div>
              <button
                onClick={() => setAccessDeniedMessage(null)}
                className="text-amber-700 hover:text-amber-900 text-[11px] font-semibold underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Compact Overview Panel (4 Compact White Stats Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Analyses
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalAnalyses}
              </div>
              <span className="text-[11px] text-slate-400">Safely inspected</span>
            </div>

            {/* High Risk */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
                High Risk
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                {highRiskCount}
              </div>
              <span className="text-[11px] text-slate-400">Critical threats</span>
            </div>

            {/* Suspicious */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">
                Suspicious
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                {suspiciousCount}
              </div>
              <span className="text-[11px] text-slate-400">Caution required</span>
            </div>

            {/* Low Risk */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                Low Risk
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {lowRiskCount}
              </div>
              <span className="text-[11px] text-slate-400">Clean baselines</span>
            </div>
          </div>

          {/* Thin Threat Profile Bar */}
          {totalAnalyses > 0 && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-800">Risk Distribution Profile</span>
                <span>{totalAnalyses} recorded scans</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                {highRiskCount > 0 && (
                  <div
                    style={{ width: `${(highRiskCount / Math.max(1, totalAnalyses)) * 100}%` }}
                    className="bg-rose-500 h-full"
                    title={`High Risk: ${highRiskCount}`}
                  />
                )}
                {suspiciousCount > 0 && (
                  <div
                    style={{ width: `${(suspiciousCount / Math.max(1, totalAnalyses)) * 100}%` }}
                    className="bg-orange-500 h-full"
                    title={`Suspicious: ${suspiciousCount}`}
                  />
                )}
                {lowRiskCount > 0 && (
                  <div
                    style={{ width: `${(lowRiskCount / Math.max(1, totalAnalyses)) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Low Risk: ${lowRiskCount}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Recent Threat Analyses Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Recent Threat Evaluations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your recent explainable scans and detected signals
                </p>
              </div>

              <Link
                to="/history"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
              >
                <span>View Full Archive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                <p className="text-xs">Loading analyses...</p>
              </div>
            ) : analyses.length === 0 ? (
              /* Beautiful Empty State */
              <div className="p-10 text-center space-y-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No analyses yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your analyzed threats will appear here once you scan a URL, email, or message.
                </p>
                <div className="pt-2">
                  <Link
                    to="/decoder"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Analyze your first threat</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Clean Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Target Preview</th>
                      <th className="pb-3">Risk Level</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyses.map(record => (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 font-medium">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 uppercase text-[10px]">
                            {record.type}
                          </span>
                        </td>
                        <td className="py-3 max-w-xs truncate text-slate-800 font-mono text-[11px]">
                          {record.inputSummary}
                        </td>
                        <td className="py-3">
                          <StatusBadge level={record.riskLevel} size="sm" />
                        </td>
                        <td className="py-3 font-semibold text-slate-800">
                          {record.riskScore}/100
                        </td>
                        <td className="py-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {record.createdAt?.toDate
                            ? record.createdAt.toDate().toLocaleDateString()
                            : 'Recent'}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(record.id, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Report Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Archived Threat Inspection
              </span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ThreatResultCard
              result={renderModalReport(selectedRecord)}
              onReset={() => setSelectedRecord(null)}
            />
          </div>
        </div>
      )}

      <Footer onOpenLegalDoc={(type) => setLegalDoc(type)} />
      <CookieConsent onOpenPrivacyModal={() => setLegalDoc('privacy')} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};
