import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
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
  User as UserIcon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
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

  const isHome = location.pathname === '/';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-cyber-950/95 backdrop-blur-md border-b border-cyber-800 shadow-lg'
          : 'bg-cyber-950/80 backdrop-blur-xs border-b border-cyber-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group focus:outline-none rounded-xl p-1"
          >
            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-cyan-600 group-hover:from-sky-400 group-hover:to-cyan-500 text-white rounded-xl shadow-glow-cyan transition-all">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                  PHISHING<span className="text-sky-400">DECODER</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-sky-950/80 text-sky-400 border border-sky-800/80 rounded-md font-mono">
                  EXPLAINABLE ENGINE
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-400 font-medium tracking-tight">
                Decode the threat. Understand the signal. Know what to do.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center space-x-7 text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            {user ? (
              <>
                <Link
                  to="/decoder"
                  className={`hover:text-white transition-colors flex items-center space-x-1.5 ${
                    location.pathname === '/decoder' ? 'text-sky-400 font-bold' : ''
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-sky-400" />
                  <span>Threat Decoder</span>
                </Link>
                <Link
                  to="/dashboard"
                  className={`hover:text-white transition-colors flex items-center space-x-1.5 ${
                    location.pathname === '/dashboard' ? 'text-sky-400 font-bold' : ''
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/history"
                  className={`hover:text-white transition-colors flex items-center space-x-1.5 ${
                    location.pathname === '/history' ? 'text-sky-400 font-bold' : ''
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                </Link>
                <Link
                  to="/learn"
                  className={`hover:text-white transition-colors flex items-center space-x-1.5 ${
                    location.pathname === '/learn' ? 'text-sky-400 font-bold' : ''
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Learn Lab</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`hover:text-white transition-colors ${
                    isHome ? 'text-sky-400 font-bold' : ''
                  }`}
                >
                  Overview
                </Link>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Capabilities
                </a>
                <a href="#workflow" className="hover:text-white transition-colors">
                  How It Works
                </a>
                <a href="#demo" className="hover:text-white transition-colors">
                  Live Engine Demo
                </a>
                <a href="#signals" className="hover:text-white transition-colors">
                  Signals Showcase
                </a>
                <a href="#learn-preview" className="hover:text-white transition-colors">
                  Spot The Phish
                </a>
              </>
            )}
          </nav>

          {/* Auth Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-cyber-900 border border-cyber-700/80 hover:border-cyber-600 transition-colors text-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-600 flex items-center justify-center text-white text-[11px] font-bold uppercase">
                    {user.email ? user.email[0] : 'U'}
                  </div>
                  <span className="text-slate-200 font-medium truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-cyber-900 border border-cyber-700 rounded-xl shadow-2xl py-2 z-50 animate-fade-in text-xs">
                    <div className="px-3 py-2 border-b border-cyber-800">
                      <p className="font-semibold text-white truncate">{user.displayName || 'Security Analyst'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/decoder"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-cyber-800"
                    >
                      <Search className="w-3.5 h-3.5 text-sky-400" />
                      <span>Analyze Threat</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-cyber-800"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                      <span>Security Dashboard</span>
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-cyber-800"
                    >
                      <History className="w-3.5 h-3.5 text-sky-400" />
                      <span>Analysis Archive</span>
                    </Link>

                    <div className="border-t border-cyber-800 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 text-left"
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
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-cyber-900 rounded-xl transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition-all group"
                >
                  <span>Start Free</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-cyber-900 focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-cyber-950 border-b border-cyber-800 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-2xl">
          <nav className="space-y-1">
            {user ? (
              <>
                <Link
                  to="/decoder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Analyze Threat (Decoder)
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Security Dashboard
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Analysis History
                </Link>
                <Link
                  to="/learn"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Spot the Phish (Learn Lab)
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Overview
                </Link>
                <a
                  href="#capabilities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Core Capabilities
                </a>
                <a
                  href="#workflow"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  How It Works
                </a>
                <a
                  href="#demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Interactive Demo
                </a>
                <a
                  href="#signals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Security Signals Showcase
                </a>
                <a
                  href="#learn-preview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-sky-400 hover:bg-cyber-900"
                >
                  Spot The Phish
                </a>
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-cyber-850 space-y-2">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-xl"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-semibold text-slate-300 border border-cyber-700 bg-cyber-900 rounded-xl"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 rounded-xl shadow-xs"
                >
                  <span>Start Free Analysis</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
