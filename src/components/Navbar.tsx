import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  Search,
  History,
  GraduationCap,
  LogOut,
  ChevronRight,
  User as UserIcon,
  Users,
  ShieldAlert,
  Inbox
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    sessionStorage.setItem('phishing_decoder_logout', 'true');
    await signOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs'
          : 'bg-white/80 backdrop-blur-xs border-b border-slate-200/80'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2.5 group focus:outline-none"
          >
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Phishing <span className="text-blue-600">Decoder</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600"
          >
            {isAdmin ? (
              // Admin-Specific Navigation
              <>
                <Link
                  to="/admin/dashboard"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/admin/dashboard' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/users"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/admin/users' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/analyses"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/admin/analyses' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Global Telemetry
                </Link>
                <Link
                  to="/admin/messages"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/admin/messages' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Messages
                </Link>
                <Link
                  to="/decoder"
                  className={`hover:text-slate-900 transition-colors text-slate-500 flex items-center gap-1 ${
                    location.pathname === '/decoder' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  <Search className="w-3 h-3 text-blue-600" />
                  <span>Decoder Studio</span>
                </Link>
              </>
            ) : (
              // Standard User / Public Navigation
              <>
                <Link
                  to="/decoder"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/decoder' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Threat Decoder
                </Link>
                <Link
                  to="/learn"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/learn' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Spot the Phish
                </Link>
                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`hover:text-slate-900 transition-colors ${
                        location.pathname === '/dashboard' ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/history"
                      className={`hover:text-slate-900 transition-colors ${
                        location.pathname === '/history' ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      History
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Auth Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors text-xs"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-bold uppercase ${isAdmin ? 'bg-amber-600' : 'bg-blue-600'}`}>
                    {user.email ? user.email[0] : 'U'}
                  </div>
                  <span className="text-slate-800 font-medium truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  {isAdmin && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-200">
                      ADMIN
                    </span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 truncate">{user.displayName || 'Security Analyst'}</p>
                        {isAdmin && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>

                    {isAdmin ? (
                      <>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Manage Users</span>
                        </Link>
                        <Link
                          to="/admin/analyses"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                          <span>Global Telemetry</span>
                        </Link>
                        <Link
                          to="/admin/messages"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <Inbox className="w-3.5 h-3.5 text-blue-600" />
                          <span>Messages</span>
                        </Link>
                        <div className="border-t border-slate-100 my-1" />
                        <Link
                          to="/decoder"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <Search className="w-3.5 h-3.5 text-blue-600" />
                          <span>Decoder Studio</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/decoder"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <Search className="w-3.5 h-3.5 text-blue-600" />
                          <span>Threat Decoder</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <History className="w-3.5 h-3.5 text-blue-600" />
                          <span>History Archive</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  <span>Start Free</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <nav className="space-y-1">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50"
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/analyses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  Global Telemetry
                </Link>
                <Link
                  to="/admin/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  Messages
                </Link>
                <div className="border-t border-slate-100 my-1 pt-1" />
                <Link
                  to="/decoder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  Decoder Studio
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/decoder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  Threat Decoder Studio
                </Link>
                <Link
                  to="/learn"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  Spot the Phish
                </Link>
                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    >
                      Security Dashboard
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    >
                      Analysis History
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                Sign Out ({user.email})
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Start Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
