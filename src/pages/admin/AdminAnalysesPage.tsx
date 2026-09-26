import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Loader2,
  ArrowLeft,
  X,
  Globe,
  Mail,
  MessageSquare,
  ShieldCheck,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { StatusBadge } from '../../components/StatusBadge';
import { ThreatResultCard } from '../../components/ThreatResultCard';
import { LegalModal, LegalDocType } from '../../components/LegalModal';
import {
  subscribeToAllAnalyses,
  StoredAnalysisRecord
} from '../../services/firestoreService';
import { AnalysisResult, AnalysisType, RiskLevel } from '../../engine/phishingEngine';

export const AdminAnalysesPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<StoredAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | AnalysisType>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<StoredAnalysisRecord | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  useEffect(() => {
    const unsub = subscribeToAllAnalyses(
      (list) => {
        setAnalyses(list);
        setLoading(false);
      },
      (err) => {
        console.error('[AdminAnalyses] Error fetching analyses:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredAnalyses = analyses.filter((record) => {
    if (typeFilter !== 'ALL' && record.type !== typeFilter) return false;
    if (riskFilter !== 'ALL' && record.riskLevel !== riskFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchInput = record.inputSummary.toLowerCase().includes(term);
      const matchSignal = record.detectedSignals.some(s => s.toLowerCase().includes(term));
      const matchUser = (record.userEmail || '').toLowerCase().includes(term);
      if (!matchInput && !matchSignal && !matchUser) return false;
    }
    return true;
  });

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Overview</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Global Threat Analysis Telemetry
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Centralized audit log of all evaluated URLs, email messages, and SMS lures across all users
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                Total Records: {analyses.length}
              </span>
            </div>
          </div>

          {/* Filtering Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by target summary, detected signal, or user email..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Vector Type Filter */}
              <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    typeFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setTypeFilter('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                    typeFilter === 'url' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>URL</span>
                </button>
                <button
                  onClick={() => setTypeFilter('email')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                    typeFilter === 'email' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </button>
                <button
                  onClick={() => setTypeFilter('message')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                    typeFilter === 'message' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Risk Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Severity:</span>
              {(['ALL', 'HIGH RISK', 'SUSPICIOUS', 'CAUTION', 'LOW'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setRiskFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    riskFilter === lvl
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Telemetry Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Loading analysis telemetry...
                </p>
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No analysis records match your query</p>
                <p className="text-xs text-slate-400">Try changing your filters or searching a different term.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Target Preview</th>
                      <th className="py-3.5 px-4">Threat Level</th>
                      <th className="py-3.5 px-4">Score</th>
                      <th className="py-3.5 px-4">Detected Signals</th>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4 text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAnalyses.map((record) => {
                      const timeStr = record.createdAt?.toDate
                        ? record.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                        : 'Active';

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                              {record.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-[260px]">
                            <span className="font-mono text-slate-900 truncate block">
                              {record.inputSummary}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge level={record.riskLevel} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {record.riskScore}/100
                          </td>
                          <td className="py-3.5 px-4 max-w-[180px]">
                            <span className="text-[11px] text-slate-600 truncate block">
                              {record.detectedSignals.length > 0
                                ? `${record.detectedSignals.length} flagged (${record.detectedSignals[0]})`
                                : 'No flags'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-[140px] truncate text-slate-500 font-mono text-[11px]">
                            {record.userEmail || (record.userId ? `${record.userId.substring(0, 8)}...` : 'Anonymous')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {timeStr}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedRecord(record)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shadow-2xs transition-colors"
                            >
                              <Eye className="w-3 h-3 text-blue-600" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Inspector for Full Analysis Report */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Detailed Threat Inspection Snapshot
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ThreatResultCard
              result={renderModalReport(selectedRecord)}
              onReset={() => setSelectedRecord(null)}
              isSaved={true}
            />
          </div>
        </div>
      )}

      <Footer onOpenLegalDoc={(type) => setLegalDoc(type)} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};
