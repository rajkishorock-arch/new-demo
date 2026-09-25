import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-950 flex flex-col items-center justify-center text-slate-300">
        <div className="p-3 bg-cyber-900 border border-cyber-800 rounded-2xl mb-4 relative">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        </div>
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Verifying security session...
        </p>
      </div>
    );
  }

  if (!user) {
    if (sessionStorage.getItem('phishing_decoder_logout') === 'true') {
      sessionStorage.removeItem('phishing_decoder_logout');
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
