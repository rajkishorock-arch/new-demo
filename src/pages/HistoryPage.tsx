import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Trash2,
  Eye,
  Loader2,
  X,
  ShieldCheck
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
import { AnalysisResult, RiskLevel, AnalysisType } from '../engine/phishingEngine';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<StoredAnalysisRecord[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | AnalysisType>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<StoredAnalysisRecord | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = subscribeToUserAnalyses(
      user.uid,
      (records) => {
        // Defensive deduplication for pre-existing legacy duplicates
        const seenSignatures = new Set<string>();
        const uniqueRecords: StoredAnalysisRecord[] = [];
        let duplicates = 0;

        for (const record of records) {
          const signature = `${record.type}|${record.inputSummary.trim()}|${record.riskScore}`;
          if (seenSignatures.has(record.id) || seenSignatures.has(signature)) {
            duplicates += 1;
          } else {
            seenSignatures.add(record.id);
            seenSignatures.add(signature);
            uniqueRecords.push(record);
          }
        }

        setDuplicateCount(duplicates);
        setAnalyses(uniqueRecords);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to stream history:', err);
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

  const filteredAnalyses = analyses.filter(record => {
    if (typeFilter !== 'ALL' && record.type !== typeFilter) return false;
    if (riskFilter !== 'ALL' && record.riskLevel !== riskFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchInput = record.inputSummary.toLowerCase().includes(term);
      const matchSignals = record.detectedSignals.some(s => s.toLowerCase().includes(term));
      if (!matchInput && !matchSignals) return false;
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
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Archive ({analyses.length} saved scans)
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Analysis History
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review and inspect your past threat evaluations
                {duplicateCount > 0 && (
                  <span className="text-slate-400 font-normal ml-1">
                    ({duplicateCount} duplicate {duplicateCount === 1 ? 'entry' : 'entries'} filtered)
                  </span>
                )}
              </p>
            </div>

            <Link
              to="/decoder"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 self-start sm:self-auto"
            >
              <Search className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search targets or keywords..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Type Filters */}
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">Type:</span>
              {(['ALL', 'url', 'email', 'message'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg uppercase text-[11px] font-medium transition-colors ${
                    typeFilter === t
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Risk Filters */}
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">Risk:</span>
              {(['ALL', 'HIGH RISK', 'SUSPICIOUS', 'CAUTION', 'LOW'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    riskFilter === r
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {r.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Analysis Rows */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden p-6 sm:p-8">
            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                <p className="text-xs">Loading history...</p>
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="p-10 text-center space-y-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No Matching Analysis Records</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {analyses.length === 0
                    ? 'Your archive is empty. Complete an analysis in the Decoder to save reports here.'
                    : 'No records match your active search or filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Target Preview</th>
                      <th className="pb-3">Risk Level</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Signals Detected</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAnalyses.map(record => (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium uppercase text-[10px]">
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
                        <td className="py-3 max-w-xs truncate text-slate-600 text-[11px]">
                          {record.detectedSignals.length > 0
                            ? record.detectedSignals.slice(0, 2).join(', ')
                            : 'Clean baseline'}
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

      {/* Modal for full past report inspection */}
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
