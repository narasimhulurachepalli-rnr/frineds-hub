import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Menu, X, Trash2, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, deleteNotification } = useNotification();
  const { themeColor } = useTheme();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const getAccentColor = () => {
    switch (themeColor) {
      case 'violet': return 'text-violet-400 border-violet-500';
      case 'emerald': return 'text-emerald-400 border-emerald-500';
      case 'rose': return 'text-rose-400 border-rose-500';
      case 'amber': return 'text-amber-400 border-amber-500';
      case 'girls': return 'text-pink-300 border-pink-400';
      case 'indigo':
      default: return 'text-indigo-400 border-indigo-500';
    }
  };

  const getButtonBg = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/45 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Menu Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 hover:bg-slate-900 lg:hidden text-slate-400 hover:text-slate-200"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <span className={`text-2xl font-black tracking-tight ${getAccentColor()}`}>
              Friend<span className="text-white dark:text-white light:text-slate-900">Hub</span>
            </span>
          </Link>
        </div>

        {/* Right side controls */}
        {user && (
          <div className="flex items-center gap-3">
            
            {/* Notifications Alert Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDrawer(!showNotifDrawer);
                  setShowDropdown(false);
                }}
                className="relative rounded-xl p-2 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Bell className="h-5.5 w-5.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {showNotifDrawer && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-lg pointer-events-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-sm font-bold">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col gap-2.5 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isRead = notif.readBy.includes(user._id);
                        return (
                          <div
                            key={notif._id}
                            className={`flex gap-2 rounded-xl p-2.5 text-xs transition-colors hover:bg-slate-900 ${
                              isRead ? 'opacity-65' : 'bg-slate-900/40 border border-slate-800/40'
                            }`}
                          >
                            <img
                              src={notif.sender?.avatar || 'https://via.placeholder.com/150'}
                              alt="Uploader"
                              className="h-7 w-7 rounded-full object-cover mt-0.5 border border-slate-700"
                            />
                            <div className="flex-grow flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-200">{notif.title}</span>
                              <span className="text-slate-400 leading-normal">{notif.message}</span>
                            </div>
                            <button
                              onClick={() => deleteNotification(notif._id)}
                              className="self-center p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowNotifDrawer(false);
                }}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-800/60 p-1 pr-3 hover:bg-slate-900 transition-all"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt="Profile"
                  className="h-8 w-8 rounded-xl object-cover border border-slate-700"
                />
                <span className="hidden text-sm font-semibold tracking-wide sm:block text-slate-300">
                  {user.username}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-lg">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs text-slate-500">Logged in as</p>
                    <p className="text-sm font-bold truncate">{user.username}</p>
                  </div>

                  <Link
                    to={`/profile/${user._id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-slate-900 transition-colors text-slate-300 hover:text-white"
                  >
                    <UserIcon className="h-4 w-4" /> My Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-slate-900 transition-colors text-slate-300 hover:text-white"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-rose-950/40 text-rose-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
