import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { user, loading, profileLoading, isAdmin, role } = useAuth();
  const location = useLocation();

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-800">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl mb-4 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          {requireAdmin ? 'Verifying administrative clearance...' : 'Verifying security session...'}
        </p>
      </div>
    );
  }

  // Unauthenticated user
  if (!user) {
    if (sessionStorage.getItem('phishing_decoder_logout') === 'true') {
      sessionStorage.removeItem('phishing_decoder_logout');
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin-only route guard
  if (requireAdmin && !isAdmin) {
    console.warn(`[RouteGuard] Access denied to ${location.pathname} for user role: ${role}`);
    return (
      <Navigate
        to="/dashboard"
        state={{
          accessDeniedNotice: 'Access denied: That area requires Administrator privileges.'
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};
