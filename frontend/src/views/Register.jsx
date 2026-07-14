import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { KeyRound, Mail, User, ShieldAlert, AlertCircle, Sparkles, MailWarning } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';
import bannerImg from '../assets/friendship_banner.png';
import girlsBannerImg from '../assets/girls_theme_banner.png';

export const Register = () => {
  const { register } = useAuth();
  const { themeColor } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // Gatekeeping states
  const [loadingGate, setLoadingGate] = useState(true);
  const [requiresInvite, setRequiresInvite] = useState(false);
  const [userCount, setUserCount] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyRegistrationAccess = async () => {
      try {
        const res = await api.get('/auth/users-count');
        const count = res.data.count;
        setUserCount(count);

        const codeParam = searchParams.get('code') || sessionStorage.getItem('inviteCode') || '';
        
        if (count >= 10) {
          setError('FriendHub registration is closed. The limit of 10 friends has been reached.');
          setRequiresInvite(true);
        } else if (count > 0 && !codeParam) {
          setRequiresInvite(true);
        } else {
          setInviteCode(codeParam);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGate(false);
      }
    };

    verifyRegistrationAccess();
  }, [searchParams]);

  const getAccentColor = () => {
    switch (themeColor) {
      case 'violet': return 'from-violet-500 to-purple-600 bg-violet-600 focus:ring-violet-500 text-violet-400';
      case 'emerald': return 'from-emerald-500 to-teal-600 bg-emerald-600 focus:ring-emerald-500 text-emerald-400';
      case 'rose': return 'from-rose-500 to-pink-600 bg-rose-600 focus:ring-rose-500 text-rose-400';
      case 'amber': return 'from-amber-500 to-yellow-600 bg-amber-600 focus:ring-amber-500 text-amber-400';
      case 'girls': return 'from-pink-300 to-rose-450 bg-pink-400 focus:ring-pink-300 text-pink-300';
      case 'indigo':
      default: return 'from-indigo-500 to-violet-600 bg-indigo-600 focus:ring-indigo-500 text-indigo-400';
    }
  };

  const getAccentText = () => {
    switch (themeColor) {
      case 'violet': return 'text-violet-400';
      case 'emerald': return 'text-emerald-400';
      case 'rose': return 'text-rose-400';
      case 'amber': return 'text-amber-400';
      case 'girls': return 'text-pink-300';
      case 'indigo':
      default: return 'text-indigo-400';
    }
  };

  const getBannerImage = () => {
    return themeColor === 'girls' ? girlsBannerImg : bannerImg;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all details.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register(username, email, password, inviteCode);
    if (res.success) {
      // Clear token from cache
      sessionStorage.removeItem('inviteCode');
      navigate('/');
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  if (loadingGate) return <Loader fullPage />;

  if (requiresInvite) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#030712] overflow-hidden animated-bg">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-rose-600/10 blur-[80px]"></div>
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-[80px]"></div>

        <div className="relative w-full max-w-md p-8 rounded-3xl glass-card text-center border border-white/5 shadow-2xl">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 mb-6 animate-pulse">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-extrabold text-white">Private FriendHub</h2>
          
          <p className="text-xs text-slate-400 mt-4.5 leading-relaxed">
            {userCount >= 10 
              ? 'FriendHub registration is closed because the limit of 10 users has been reached.'
              : 'This is a private FriendHub. Please request an invitation from the Admin.'}
          </p>

          {userCount < 10 && (
            <div className="mt-4 text-[10px] text-pink-300 font-extrabold bg-pink-950/20 py-1.5 px-3 rounded-full inline-block border border-pink-900/30">
              Remaining slots: {10 - userCount} / 10
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#030712] overflow-hidden animated-bg">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-[80px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-[80px] animate-pulse-slow"></div>

      <div className="relative w-full max-w-5xl rounded-3xl glass-card text-slate-100 shadow-2xl border border-white/5 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Visual Side (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-950/65 border-r border-slate-900/60">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-4 w-4 text-rose-400 animate-pulse" /> Workspace Platform
            </span>
            <h2 className="text-3xl font-extrabold mt-3 leading-tight text-white">
              {themeColor === 'girls' ? (
                <>
                  Dreamy Pastel &amp; <br />
                  <span className={getAccentText()}>Girls Aesthetic ✨🌸</span>
                </>
              ) : (
                <>
                  A Private Sanctuary for Our <br />
                  <span className={getAccentText()}>Friendship Memories</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-sm">
              {themeColor === 'girls' 
                ? 'Welcome to our cozy circle workspace. Share stories, log study notes, keep comment diaries on trip memories, and play arcade games.'
                : 'Connect daily, upload study notes, organize trips, vote on group polls, play arcade games, and check on streaks.'}
            </p>
          </div>

          <img
            src={getBannerImage()}
            alt="Friends Sunset"
            className="w-full h-52 object-cover rounded-2xl border border-slate-900 shadow-2xl"
          />

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            FriendHub &copy; {new Date().getFullYear()} &bull; Limited to 10 friends.
          </div>
        </div>

        {/* Right Form Side */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8 lg:text-left">
            <span className={`text-4xl font-black tracking-tight bg-gradient-to-r ${getAccentColor().split(' ')[0]} ${getAccentColor().split(' ')[1]} bg-clip-text text-transparent`}>
              FriendHub
            </span>
            <p className="text-xs text-slate-400 mt-2 tracking-wide uppercase">
              {themeColor === 'girls' ? '💅 Girls Circle registration' : 'Create Private Account'}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-950/40 border border-rose-500/25 p-3 text-xs text-rose-300 mb-5">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="siva_lakshmi"
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm glass-input font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="siva@friendhub.com"
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm glass-input font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm glass-input font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Invite Code
                </label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder={userCount === 0 ? "Not required for first user (Seeded Admin)" : "FH-XXXXXX"}
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm glass-input font-medium border border-rose-500/20 text-rose-300 disabled:opacity-50"
                  disabled={userCount === 0 || !!searchParams.get('code')}
                  required={userCount > 0}
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                {userCount === 0 
                  ? "*You are the first member. Registering will automatically set up the Admin account."
                  : "*This is a private friend circle. An active invite code is required to sign up."}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer ${
                getAccentColor().split(' ').slice(0, 2).join(' ')
              }`}
            >
              {loading ? 'Validating Token...' : 'Register'}
            </button>

          </form>

          <div className="mt-8 text-center text-xs text-slate-500 lg:text-left">
            Already registered?{' '}
            <Link to="/login" className={`font-semibold hover:underline ${getAccentText()}`}>
              Log in here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
