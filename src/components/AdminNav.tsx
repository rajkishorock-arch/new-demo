import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, Inbox } from 'lucide-react';

export const AdminNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Analyses', to: '/admin/analyses', icon: ShieldAlert },
    { label: 'Messages', to: '/admin/messages', icon: Inbox }
  ];

  return (
    <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
