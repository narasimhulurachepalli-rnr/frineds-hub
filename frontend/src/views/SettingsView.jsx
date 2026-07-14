import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { Settings, ShieldAlert, KeyRound, BellRing, UserMinus, Shield } from 'lucide-react';

export const SettingsView = () => {
  const { changePassword, deleteAccount } = useAuth();
  const { themeColor } = useTheme();

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Mocks alerts
  const [allowDms, setAllowDms] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match confirm password.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    setPwLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setPwLoading(false);

    if (res.success) {
      setPwSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwError(res.message);
    }
  };

  const handleDeleteClick = async () => {
    const confirmation = window.confirm(
      "CAUTION: Are you absolutely sure you want to delete your FriendHub account? This will remove your achievements, logs, and profile permanently from the group database."
    );
    if (confirmation) {
      const res = await deleteAccount();
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column (Settings Panels: Theme and alerts) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Theme Settings wrapper */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-3">
          <span className="text-sm font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-indigo-400" /> General Appearance
          </span>
          <ThemeToggle />
        </div>

        {/* Alerts Settings wrapper */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
          <span className="text-sm font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
            <BellRing className="h-4.5 w-4.5 text-indigo-400" /> Notifications &amp; Privacy
          </span>

          <div className="flex flex-col gap-3 text-xs font-semibold">
            
            <label className="flex items-center justify-between rounded-xl bg-slate-900/35 border border-slate-900 p-3 hover:border-slate-800 transition-all cursor-pointer">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-200">Real-time Chat Mentions</span>
                <span className="text-[10px] text-slate-500 font-light">Play notification sounds on receiving chat alerts.</span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={() => setSoundAlerts(!soundAlerts)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl bg-slate-900/35 border border-slate-900 p-3 hover:border-slate-800 transition-all cursor-pointer">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-200">Share Profile details with search</span>
                <span className="text-[10px] text-slate-500 font-light">Allow other members to search your skills.</span>
              </div>
              <input
                type="checkbox"
                checked={allowDms}
                onChange={() => setAllowDms(!allowDms)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

          </div>
        </div>

      </div>

      {/* Right Column (Change Password & Delete Account) */}
      <div className="flex flex-col gap-6">
        
        {/* Change Password form */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
          <span className="text-sm font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
            <KeyRound className="h-4.5 w-4.5 text-indigo-400" /> Change Password
          </span>

          {pwError && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-500/25 p-3 text-[10px] text-rose-300">
              {pwError}
            </div>
          )}

          {pwSuccess && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/25 p-3 text-[10px] text-emerald-300">
              {pwSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3.5 mt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-semibold">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl py-2 px-3 text-xs glass-input font-medium"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-semibold">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl py-2 px-3 text-xs glass-input font-medium"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-semibold">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl py-2 px-3 text-xs glass-input font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer mt-1 ${getAccentBtn()}`}
            >
              {pwLoading ? 'Updating credentials...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Delete Account card */}
        <div className="rounded-2xl border border-rose-500/10 bg-rose-950/10 p-5 shadow-lg flex flex-col gap-3.5">
          <span className="text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <UserMinus className="h-4.5 w-4.5" /> Danger Zone
          </span>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Once you delete your account, there is no going back. All database references, achievements, streaks, and posts owned by you will be modified or removed.
          </p>
          <button
            onClick={handleDeleteClick}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer mt-1"
          >
            Delete Account Permanently
          </button>
        </div>

      </div>

    </div>
  );
};

export default SettingsView;
