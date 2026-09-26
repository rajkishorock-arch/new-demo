import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { AdminNav } from '../../components/AdminNav';
import { LegalModal, LegalDocType } from '../../components/LegalModal';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeToAllUsers,
  updateUserRole,
  UserProfileData,
  UserRole
} from '../../services/firestoreService';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [confirmingRoleChange, setConfirmingRoleChange] = useState<{
    user: UserProfileData;
    targetRole: UserRole;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submittingRole, setSubmittingRole] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  useEffect(() => {
    const unsub = subscribeToAllUsers(
      (list) => {
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        console.error('[AdminUsers] Subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = (u.displayName || '').toLowerCase().includes(term);
      const matchEmail = (u.email || '').toLowerCase().includes(term);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  const handleRoleChange = async () => {
    if (!confirmingRoleChange || !currentAdmin) return;
    const { user: targetUser, targetRole } = confirmingRoleChange;

    if (targetUser.uid === currentAdmin.uid && targetRole === 'user') {
      setActionError('Safety protection: You cannot demote your own administrator account.');
      setConfirmingRoleChange(null);
      return;
    }

    setSubmittingRole(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const ok = await updateUserRole(targetUser.uid, targetRole);
      if (ok) {
        setActionSuccess(`Role for ${targetUser.email} updated to ${targetRole.toUpperCase()}`);
        setConfirmingRoleChange(null);
        if (selectedUser?.uid === targetUser.uid) {
          setSelectedUser({ ...selectedUser, role: targetRole });
        }
      } else {
        setActionError('Failed to update role. Please verify your administrator privileges.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error occurred while updating role.');
    } finally {
      setSubmittingRole(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <AdminNav />

          {/* Top Breadcrumb & Header */}
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
                User Management Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Inspect registered user accounts, role authorizations, and individual threat scan metrics
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                Total: {users.length} Users
              </span>
            </div>
          </div>

          {/* Feedback alerts */}
          {actionSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-2xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </span>
              <button onClick={() => setActionSuccess(null)} className="text-emerald-700 font-bold hover:underline">
                ✕
              </button>
            </div>
          )}

          {actionError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between shadow-2xs">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </span>
              <button onClick={() => setActionError(null)} className="text-rose-700 font-bold hover:underline">
                ✕
              </button>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    roleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  onClick={() => setRoleFilter('user')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    roleFilter === 'user' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Users ({users.filter(u => u.role === 'user').length})
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    roleFilter === 'admin' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admins ({users.filter(u => u.role === 'admin').length})
                </button>
              </div>
            </div>
          </div>

          {/* User Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Loading user records...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No users match your criteria</p>
                <p className="text-xs text-slate-400">Try adjusting your search query or role filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Total Scans</th>
                      <th className="py-3.5 px-4">High Risk</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const joinedStr = u.createdAt?.toDate
                        ? u.createdAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Active';

                      const isSelf = currentAdmin?.uid === u.uid;

                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {(u.displayName || u.email || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 block">
                                  {u.displayName || 'Security Analyst'}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] text-blue-600 font-bold">You (Current Admin)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {u.role === 'admin' ? 'ADMINISTRATOR' : 'STANDARD USER'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {u.stats?.totalAnalyses ?? 0}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-rose-600">
                              {u.stats?.highRiskCount ?? 0}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {joinedStr}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shadow-2xs transition-colors"
                            >
                              Inspect
                            </button>

                            {u.role === 'user' ? (
                              <button
                                onClick={() => setConfirmingRoleChange({ user: u, targetRole: 'admin' })}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                Make Admin
                              </button>
                            ) : (
                              !isSelf && (
                                <button
                                  onClick={() => setConfirmingRoleChange({ user: u, targetRole: 'user' })}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-[11px] font-semibold transition-colors"
                                >
                                  Demote to User
                                </button>
                              )
                            )}
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

      {/* Role Confirmation Modal */}
      {confirmingRoleChange && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-fade-in">
            <div className="flex items-center space-x-3 text-slate-900">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">
                Confirm Role Modification
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to change the authorization role of{' '}
              <strong className="text-slate-900">{confirmingRoleChange.user.email}</strong> to{' '}
              <span className="font-bold text-blue-600 uppercase">
                {confirmingRoleChange.targetRole}
              </span>?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmingRoleChange(null)}
                disabled={submittingRole}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={submittingRole}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                {submittingRole && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Change</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Inspection Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm">
                  {(selectedUser.displayName || selectedUser.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedUser.displayName || 'Analyst'}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">UID Reference</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate block mt-0.5">
                    {selectedUser.uid}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Authorization Role</span>
                  <span className="font-bold text-blue-700 text-xs block mt-0.5 uppercase">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Scan History Summary
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-base font-extrabold text-slate-900 block">
                      {selectedUser.stats?.totalAnalyses ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-500">Total</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-rose-200">
                    <span className="text-base font-extrabold text-rose-600 block">
                      {selectedUser.stats?.highRiskCount ?? 0}
                    </span>
                    <span className="text-[10px] text-rose-600">High</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-orange-200">
                    <span className="text-base font-extrabold text-orange-600 block">
                      {selectedUser.stats?.suspiciousCount ?? 0}
                    </span>
                    <span className="text-[10px] text-orange-600">Suspicious</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <span className="text-base font-extrabold text-emerald-600 block">
                      {(selectedUser.stats?.lowRiskCount ?? 0) + (selectedUser.stats?.cautionCount ?? 0)}
                    </span>
                    <span className="text-[10px] text-emerald-600">Safe/Caution</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer onOpenLegalDoc={(type) => setLegalDoc(type)} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};
