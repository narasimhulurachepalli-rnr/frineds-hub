import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Terminal, Shield, Cpu, Users } from 'lucide-react';

export const AboutPage = () => {
  const { themeColor } = useTheme();

  const getAccentText = () => {
    switch (themeColor) {
      case 'violet': return 'text-violet-400';
      case 'emerald': return 'text-emerald-400';
      case 'rose': return 'text-rose-400';
      case 'amber': return 'text-amber-400';
      case 'indigo':
      default: return 'text-indigo-400';
    }
  };

  return (
    <div className="max-w-3xl mx-auto rounded-3xl border border-slate-900 bg-slate-950/45 p-6 md:p-8 shadow-xl flex flex-col gap-6">
      
      {/* Banner */}
      <div className="text-center border-b border-slate-900 pb-6">
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center justify-center gap-1.5 mb-1.5">
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" /> Workspace Details
        </span>
        <h1 className="text-3xl font-extrabold text-white">About FriendHub</h1>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          A premium, high-performance private social platform built specifically for a close circle of exactly 10 friends.
        </p>
      </div>

      {/* Grid of specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-2">
        
        <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4.5 flex gap-3">
          <Cpu className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-200">Modern MERN Architecture</span>
            <p className="text-slate-400 leading-relaxed font-light">
              Powered by Node.js, Express, MongoDB Atlas, and React.js compiled with Vite for instant loading.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4.5 flex gap-3">
          <Terminal className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-200">Real-time WebSockets</span>
            <p className="text-slate-400 leading-relaxed font-light">
              Socket.io handles instant messaging sync, typing indicators, read receipts, and user presence toggles.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4.5 flex gap-3">
          <Shield className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-200">Security Middleware</span>
            <p className="text-slate-400 leading-relaxed font-light">
              Guarded by Helmet headers, rate limiters, Mongo sanitizations, password hash systems, and JWT protections.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-4.5 flex gap-3">
          <Users className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-200">Capacity Enforced</span>
            <p className="text-slate-400 leading-relaxed font-light">
              Invite-only registration strictly capped at exactly 10 members to maintain maximum privacy.
            </p>
          </div>
        </div>

      </div>

      <div className="border-t border-slate-900 pt-6 text-[10px] text-slate-500 leading-relaxed text-center font-light">
        FriendHub Workspace Platform &bull; Made with pride by Siva and team &bull; Version 1.0.0 (Release 2026)
      </div>

    </div>
  );
};

export default AboutPage;
