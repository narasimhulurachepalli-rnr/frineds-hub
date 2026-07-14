import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFileUrl } from '../utils/helpers';
import { 
  LayoutDashboard, MessageSquare, BookOpen, HardDrive, 
  Image, Sparkles, Gamepad2, FileText, Calendar, 
  Trophy, Brain, Shield, Settings, HelpCircle, User
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const getActiveStyle = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600/25 border-r-2 border-violet-500 text-violet-300';
      case 'emerald': return 'bg-emerald-600/25 border-r-2 border-emerald-500 text-emerald-300';
      case 'rose': return 'bg-rose-600/25 border-r-2 border-rose-500 text-rose-300';
      case 'amber': return 'bg-amber-600/25 border-r-2 border-amber-500 text-amber-300';
      case 'girls': return 'bg-pink-400/20 border-r-2 border-pink-300 text-pink-300 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600/25 border-r-2 border-indigo-500 text-indigo-300';
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Group Chat', path: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Study Hub', path: '/study', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'File Sharing', path: '/files', icon: <HardDrive className="h-5 w-5" /> },
    { name: 'Memories', path: '/memories', icon: <Image className="h-5 w-5" /> },
    { name: 'Shared Notes', path: '/notes', icon: <FileText className="h-5 w-5" /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Entertainment', path: '/entertainment', icon: <Sparkles className="h-5 w-5" /> },
    { name: 'Games Room', path: '/games', icon: <Gamepad2 className="h-5 w-5" /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy className="h-5 w-5" /> },
    { name: 'AI Corner', path: '/ai', icon: <Brain className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const sideMenu = (
    <div className="flex flex-col h-full bg-slate-950/45 border-r border-white/5 backdrop-blur-lg p-4">
      {/* Title */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-white/5 mb-4">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">FriendHub Menu</span>
      </div>

      {/* Nav List */}
      <nav className="flex-grow flex flex-col gap-1 overflow-y-auto pr-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-900/70 hover:text-white ${
                isActive ? getActiveStyle() : ''
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}

        {/* Admin conditional item */}
        {user?.role === 'Admin' && (
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-900/70 hover:text-white ${
                isActive ? getActiveStyle() : ''
              }`
            }
          >
            <Shield className="h-5 w-5 text-indigo-400" />
            Admin Panel
          </NavLink>
        )}
      </nav>

      {/* Profile quick footer */}
      {user && (
        <div className="mt-auto border-t border-slate-900 pt-4 flex items-center gap-3 px-1">
          <img
            src={user.avatar ? getFileUrl(user.avatar) : 'https://via.placeholder.com/150'}
            alt="Pfp"
            className="h-9 w-9 rounded-xl object-cover border border-slate-800"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">{user.username}</span>
            <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-45 bg-slate-950/65 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block lg:w-64 h-[calc(100vh-4rem)] flex-shrink-0">
        {sideMenu}
      </aside>

      {/* Mobile Sidebar Slide Drawer */}
      <aside
        className={`fixed bottom-0 top-16 z-45 w-64 lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sideMenu}
      </aside>
    </>
  );
};

export default Sidebar;
