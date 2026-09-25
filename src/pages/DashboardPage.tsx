import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Search,
  History,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Loader2,
  Calendar,
  X,
  Eye,
  Trash2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StatusBadge } from '../components/StatusBadge';
import { ThreatResultCard } from '../components/ThreatResultCard';
import { CookieConsent } from '../components/CookieConsent';
import { LegalModal, LegalDocType } from '../components/LegalModal';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile,
  getUserAnalyses,
  deleteAnalysisRecord,
  StoredAnalysisRecord,
  UserProfileData
} from '../services/firestoreService';
import { AnalysisResult } from '../engine/phishingEngine';

export const DashboardPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [analyses, setAnalyses] = useState<StoredAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<StoredAnalysisRecord | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const records = await getUserAnalyses(user.uid, 10);
        setAnalyses(records);
      } catch (err) {
        console.error('Failed to load dashboard analyses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  // Convert stored snapshot to AnalysisResult for full viewing
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

  // Calculate stats from live analyses or profile
  const totalAnalyses = userProfile?.stats?.totalAnalyses ?? analyses.length;
  const highRiskCount = userProfile?.stats?.highRiskCount ?? analyses.filter(a => a.riskLevel === 'HIGH RISK').length;
  const suspiciousCount = userProfile?.stats?.suspiciousCount ?? analyses.filter(a => a.riskLevel === 'SUSPICIOUS').length;
  const lowRiskCount = userProfile?.stats?.lowRiskCount ?? analyses.filter(a => a.riskLevel === 'LOW').length;

  return (
    <div className="min-h-screen bg-cyber-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-cyber-850 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-sky-950 border border-sky-800 text-sky-400 px-2 py-0.5 rounded font-bold">
                  SECURITY DASHBOARD
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Personal Risk Overview
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Analyst'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Monitoring explainable phishing indicators and safe inspection logs
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/decoder"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-glow-cyan transition-all flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Launch Decoder</span>
              </Link>
              <Link
                to="/learn"
                className="px-4 py-2.5 bg-cyber-900 hover:bg-cyber-850 border border-cyber-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Spot the Phish</span>
              </Link>
            </div>
          </div>

          {/* KPI CARDS (Analyses, High Risk, Suspicious, Low Risk) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Analyses */}
            <div className="p-5 sm:p-6 bg-cyber-900/90 border border-cyber-700/80 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono uppercase tracking-wider">Total Analyses</span>
                <FileText className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  {totalAnalyses}
                </span>
                <span className="text-xs text-slate-400">items</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-cyber-850">
                Safe zero-execution heuristic scans
              </p>
            </div>

            {/* High Risk */}
            <div className="p-5 sm:p-6 bg-cyber-900/90 border border-rose-900/40 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-rose-300">
                <span className="font-mono uppercase tracking-wider">High Risk</span>
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-rose-400">
                  {highRiskCount}
                </span>
                <span className="text-xs text-rose-300/70">threats</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-cyber-850">
                Multiple critical signals detected
              </p>
            </div>

            {/* Suspicious */}
            <div className="p-5 sm:p-6 bg-cyber-900/90 border border-orange-900/40 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-orange-300">
                <span className="font-mono uppercase tracking-wider">Suspicious</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-orange-400">
                  {suspiciousCount}
                </span>
                <span className="text-xs text-orange-300/70">items</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-cyber-850">
                Elevated caution required
              </p>
            </div>

            {/* Low Risk */}
            <div className="p-5 sm:p-6 bg-cyber-900/90 border border-emerald-900/40 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-300">
                <span className="font-mono uppercase tracking-wider">Low Risk</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  {lowRiskCount}
                </span>
                <span className="text-xs text-emerald-300/70">verified</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-cyber-850">
                Clean baseline heuristics
              </p>
            </div>
          </div>

          {/* Risk Distribution Breakdown Bar */}
          {totalAnalyses > 0 && (
            <div className="p-4 bg-cyber-900 border border-cyber-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 font-bold text-slate-300 uppercase">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Threat Profile Distribution</span>
                </span>
                <span>{totalAnalyses} Recorded Evaluations</span>
              </div>

              <div className="w-full h-3 bg-cyber-950 rounded-full overflow-hidden flex border border-cyber-800">
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

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>High ({highRiskCount})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Suspicious ({suspiciousCount})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Low ({lowRiskCount})</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Table */}
          <div className="bg-cyber-900 border border-cyber-700/80 rounded-2xl shadow-xl overflow-hidden space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-800">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Recent Threat Evaluations
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stored in isolated Firestore records (users/{user?.uid}/analyses)
                </p>
              </div>

              <Link
                to="/history"
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
              >
                <span>View Full Archive</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-400" />
                <p className="text-xs font-mono">Loading your recent analyses...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div className="p-12 text-center space-y-3 bg-cyber-950/60 rounded-xl border border-cyber-800">
                <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Analysis Records Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven't scanned any suspicious items yet. Launch the Decoder to analyze your first URL, email, or SMS.
                </p>
                <Link
                  to="/decoder"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Analyze Your First Threat</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-cyber-800 text-slate-400 font-mono uppercase text-[10px]">
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Target Preview</th>
                      <th className="pb-3 font-semibold">Risk Level</th>
                      <th className="pb-3 font-semibold">Score</th>
                      <th className="pb-3 font-semibold">Signals</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-800/60">
                    {analyses.map(record => (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className="hover:bg-cyber-850/60 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 font-mono">
                          <span className="px-2 py-0.5 rounded bg-cyber-950 border border-cyber-800 text-sky-400 font-bold uppercase text-[10px]">
                            {record.type}
                          </span>
                        </td>
                        <td className="py-3.5 max-w-xs truncate text-slate-200 font-mono text-[11px]">
                          {record.inputSummary}
                        </td>
                        <td className="py-3.5">
                          <StatusBadge level={record.riskLevel} size="sm" />
                        </td>
                        <td className="py-3.5 font-mono font-bold text-slate-300">
                          {record.riskScore}/100
                        </td>
                        <td className="py-3.5 text-slate-400 text-[11px]">
                          {record.findingsCount} signals
                        </td>
                        <td className="py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                          {record.createdAt?.toDate
                            ? record.createdAt.toDate().toLocaleDateString()
                            : 'Recent'}
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyber-800 hover:bg-sky-600 text-slate-200 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Report</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(record.id, e)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Record"
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

      {/* Modal / Slide-over for Viewing Saved Report */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-cyber-950 border border-cyber-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase bg-sky-950 border border-sky-800 text-sky-400 px-2 py-0.5 rounded font-bold">
                  ARCHIVED REPORT
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {selectedRecord.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
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
