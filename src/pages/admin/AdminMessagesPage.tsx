import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Mail,
  Search,
  CheckCircle2,
  Trash2,
  Loader2,
  ArrowLeft,
  X,
  MessageSquare,
  Clock,
  Check
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { LegalModal, LegalDocType } from '../../components/LegalModal';
import {
  subscribeToContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
  ContactMessage
} from '../../services/firestoreService';

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'new' | 'read' | 'resolved'>('ALL');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToContactMessages(
      (list) => {
        setMessages(list);
        setLoading(false);
      },
      (err) => {
        console.error('[AdminMessages] Error fetching contact messages:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleUpdateStatus = async (msgId: string, status: 'new' | 'read' | 'resolved') => {
    const ok = await updateContactMessageStatus(msgId, status);
    if (ok) {
      setActionNotice(`Message marked as ${status.toUpperCase()}`);
      if (selectedMessage?.id === msgId) {
        setSelectedMessage({ ...selectedMessage, status });
      }
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this message?')) {
      const ok = await deleteContactMessage(msgId);
      if (ok) {
        setActionNotice('Message successfully deleted.');
        if (selectedMessage?.id === msgId) {
          setSelectedMessage(null);
        }
        setTimeout(() => setActionNotice(null), 3000);
      }
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (statusFilter !== 'ALL' && msg.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = msg.name.toLowerCase().includes(term);
      const matchEmail = msg.email.toLowerCase().includes(term);
      const matchMsg = msg.message.toLowerCase().includes(term);
      const matchSub = (msg.subject || '').toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchMsg && !matchSub) return false;
    }
    return true;
  });

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
                User Communications & Inquiries
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Incoming contact submissions and feedback sent from the public website
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                Total: {messages.length} Messages
              </span>
            </div>
          </div>

          {actionNotice && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>{actionNotice}</span>
              </div>
              <button onClick={() => setActionNotice(null)} className="text-blue-600 font-bold hover:underline">
                ✕
              </button>
            </div>
          )}

          {/* Filtering Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by sender name, email, or message snippet..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setStatusFilter('new')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'new' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                New ({messages.filter(m => m.status === 'new').length})
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'resolved' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Resolved ({messages.filter(m => m.status === 'resolved').length})
              </button>
            </div>
          </div>

          {/* Messages Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Retrieving incoming inquiries...
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No contact messages found</p>
                <p className="text-xs text-slate-400">Submissions from the landing page contact form will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Sender</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Subject</th>
                      <th className="py-3.5 px-4">Message Preview</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMessages.map((msg) => {
                      const timeStr = msg.createdAt?.toDate
                        ? msg.createdAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Recent';

                      return (
                        <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                msg.status === 'new'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : msg.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {msg.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {msg.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {msg.email}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {msg.subject || 'General'}
                          </td>
                          <td className="py-3.5 px-4 max-w-[240px] truncate text-slate-600">
                            {msg.message}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {timeStr}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedMessage(msg)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shadow-2xs transition-colors"
                            >
                              Read
                            </button>
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors inline-flex items-center"
                              title="Delete message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedMessage.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedMessage.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-100">
                <span>Subject: <strong className="text-slate-800">{selectedMessage.subject || 'General Inquiry'}</strong></span>
                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedMessage.status}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {selectedMessage.message}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center space-x-2">
                {selectedMessage.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'resolved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer onOpenLegalDoc={(type) => setLegalDoc(type)} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
};
