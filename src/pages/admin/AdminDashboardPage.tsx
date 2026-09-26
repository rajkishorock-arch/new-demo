import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Search,
  AlertTriangle,
  ShieldAlert,
  Shield,
  Globe,
  Mail,
  MessageSquare,
  ArrowRight,
  Loader2,
  Eye,
  X,
  Inbox
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { StatusBadge } from '../../components/StatusBadge';
import { ThreatResultCard } from '../../components/ThreatResultCard';
import { LegalModal, LegalDocType } from '../../components/LegalModal';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeToAllUsers,
  subscribeToAllAnalyses,
  subscribeToContactMessages,
  UserProfileData,
  StoredAnalysisRecord,
  ContactMessage
} from '../../services/firestoreService';
import { AnalysisResult } from '../../engine/phishingEngine';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<UserProfileData[]>([]);
  const [analysesList, setAnalysesList] = useState<StoredAnalysisRecord[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<StoredAnalysisRecord | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  useEffect(() => {
    const unsubUsers = subscribeToAllUsers(
      (users) => {
        setUsersList(users);
        setLoadingUsers(false);
      },
      () => setLoadingUsers(false)
    );

    const unsubAnalyses = subscribeToAllAnalyses(
      (records) => {
        setAnalysesList(records);
        setLoadingAnalyses(false);
      },
      () => setLoadingAnalyses(false)
    );

    const unsubMessages = subscribeToContactMessages(
      (msgs) => {
        setMessagesList(msgs);
      }
    );

    return () => {
      unsubUsers();
      unsubAnalyses();
      unsubMessages();
    };
  }, []);

  // Compute live aggregates from real analyses
  const totalAnalyses = analysesList.length;
  const highRiskCount = analysesList.filter(a => a.riskLevel === 'HIGH RISK').length;
  const suspiciousCount = analysesList.filter(a => a.riskLevel === 'SUSPICIOUS').length;
  const cautionCount = analysesList.filter(a => a.riskLevel === 'CAUTION').length;
  const lowRiskCount = analysesList.filter(a => a.riskLevel === 'LOW').length;

  const urlCount = analysesList.filter(a => a.type === 'url').length;
  const emailCount = analysesList.filter(a => a.type === 'email').length;
  const messageCount = analysesList.filter(a => a.type === 'message').length;

  const newMessagesCount = messagesList.filter(m => m.status === 'new').length;

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

  const isLoading = loadingUsers || loadingAnalyses;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Admin Command Center
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  REAL FIRESTORE DATA
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                System Threat Intelligence Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Live monitoring across all registered users, inspection vectors, and detected threat telemetry
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/admin/users"
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-2"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users ({usersList.length})</span>
              </Link>
              <Link
                to="/admin/analyses"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>All Scans ({totalAnalyses})</span>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Connecting to live telemetry database...
              </p>
            </div>
          ) : (
            <>
              {/* Primary KPI Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Total Users */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Users</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                      {usersList.length}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Registered accounts</p>
                  </div>
                </div>

                {/* Total Analyses */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Total Scans</span>
                    <Search className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                      {totalAnalyses}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Completed evaluations</p>
                  </div>
                </div>

                {/* High Risk */}
                <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-rose-600">
                    <span className="text-[11px] font-medium uppercase tracking-wider">High Risk</span>
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600">
                      {highRiskCount}
                    </span>
                    <p className="text-[10px] text-rose-700 mt-0.5">Critical threat triggers</p>
                  </div>
                </div>

                {/* Suspicious */}
                <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-orange-600">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Suspicious</span>
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-orange-600">
                      {suspiciousCount}
                    </span>
                    <p className="text-[10px] text-orange-700 mt-0.5">Elevated deception markers</p>
                  </div>
                </div>

                {/* Caution */}
                <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-600">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Caution</span>
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600">
                      {cautionCount}
                    </span>
                    <p className="text-[10px] text-amber-700 mt-0.5">Ambiguous patterns</p>
                  </div>
                </div>

                {/* Low Risk */}
                <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Low Risk</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600">
                      {lowRiskCount}
                    </span>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Clean / Safe baselines</p>
                  </div>
                </div>
              </div>

              {/* Vector Distribution and Risk Profile Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Vector Type Distribution */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Analysis Vectors</h2>
                      <p className="text-xs text-slate-500">Distribution across incoming threat payloads</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      {totalAnalyses} Total
                    </span>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* URL */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span>URL Inspections</span>
                        </span>
                        <span className="font-semibold text-slate-900">
                          {urlCount} ({totalAnalyses > 0 ? Math.round((urlCount / totalAnalyses) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${totalAnalyses > 0 ? (urlCount / totalAnalyses) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-amber-600" />
                          <span>Email Bodies & Pretexts</span>
                        </span>
                        <span className="font-semibold text-slate-900">
                          {emailCount} ({totalAnalyses > 0 ? Math.round((emailCount / totalAnalyses) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${totalAnalyses > 0 ? (emailCount / totalAnalyses) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                          <span>SMS / Instant Chat Lures</span>
                        </span>
                        <span className="font-semibold text-slate-900">
                          {messageCount} ({totalAnalyses > 0 ? Math.round((messageCount / totalAnalyses) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${totalAnalyses > 0 ? (messageCount / totalAnalyses) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Risk Profile Distribution */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Risk Severity Breakdown</h2>
                      <p className="text-xs text-slate-500">Heuristic threat severity classification</p>
                    </div>
                    <Link
                      to="/admin/messages"
                      className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Inquiries ({newMessagesCount} new)</span>
                    </Link>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-rose-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>High Risk Threats</span>
                        </span>
                        <span className="font-semibold text-rose-900">
                          {highRiskCount} ({totalAnalyses > 0 ? Math.round((highRiskCount / totalAnalyses) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${totalAnalyses > 0 ? (highRiskCount / totalAnalyses) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-orange-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          <span>Suspicious Signals</span>
                        </span>
                        <span className="font-semibold text-orange-900">
                          {suspiciousCount} ({totalAnalyses > 0 ? Math.round((suspiciousCount / totalAnalyses) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${totalAnalyses > 0 ? (suspiciousCount / totalAnalyses) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-emerald-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Low Risk & Caution</span>
                        </span>
                        <span className="font-semibold text-emerald-900">
                          {lowRiskCount + cautionCount} ({totalAnalyses > 0 ? Math.round(((lowRiskCount + cautionCount) / totalAnalyses) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${totalAnalyses > 0 ? ((lowRiskCount + cautionCount) / totalAnalyses) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent System-Wide Analysis Activity Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Recent Global Analysis Telemetry</h2>
                    <p className="text-xs text-slate-500">Live evaluations across the Phishing Decoder network</p>
                  </div>
                  <Link
                    to="/admin/analyses"
                    className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <span>View all {totalAnalyses} records</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {analysesList.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No threat analyses recorded yet</p>
                    <p className="text-xs text-slate-400">Scans performed in the Decoder Studio will populate here in real-time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Target Preview</th>
                          <th className="py-3 px-3">Severity</th>
                          <th className="py-3 px-3">Score</th>
                          <th className="py-3 px-3">User Ref</th>
                          <th className="py-3 px-3">Time</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analysesList.slice(0, 10).map((record) => {
                          const timeStr = record.createdAt?.toDate
                            ? record.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                            : 'Just now';

                          return (
                            <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                  {record.type}
                                </span>
                              </td>
                              <td className="py-3 px-3 max-w-[280px]">
                                <span className="font-mono text-slate-900 truncate block">
                                  {record.inputSummary}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <StatusBadge level={record.riskLevel} size="sm" />
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-900">
                                  {record.riskScore}/100
                                </span>
                              </td>
                              <td className="py-3 px-3 max-w-[140px] truncate text-slate-500">
                                {record.userEmail || (record.userId ? `${record.userId.substring(0, 8)}...` : 'Anonymous')}
                              </td>
                              <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                                {timeStr}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => setSelectedRecord(record)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shadow-2xs transition-colors"
                                >
                                  <Eye className="w-3 h-3 text-blue-600" />
                                  <span>Inspect</span>
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
            </>
          )}
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
