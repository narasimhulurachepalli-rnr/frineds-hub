import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import bannerImg from '../assets/friendship_banner.png';
import girlsBannerImg from '../assets/girls_theme_banner.png';

export const Login = () => {
  const { login } = useAuth();
  const { themeColor } = useTheme();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const getAccentColor = () => {
    switch (themeColor) {
      case 'violet': return 'from-violet-500 to-purple-600 bg-violet-600 focus:ring-violet-500 text-violet-400';
      case 'emerald': return 'from-emerald-500 to-teal-600 bg-emerald-600 focus:ring-emerald-500 text-emerald-400';
      case 'rose': return 'from-rose-500 to-pink-600 bg-rose-600 focus:ring-rose-500 text-rose-400';
      case 'amber': return 'from-amber-500 to-yellow-600 bg-amber-600 focus:ring-amber-500 text-amber-400';
      case 'girls': return 'from-pink-300 to-rose-400 bg-pink-400 focus:ring-pink-300 text-pink-300';
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setError('');
    setForgotMsg('');

    const res = await login(emailOrUsername, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  const handleForgotClick = () => {
    setForgotMsg('Password recoveries for FriendHub are handled manually. Please reach out to your group Admin directly to request a password reset.');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#030712] overflow-hidden animated-bg">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-[80px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-[80px] animate-pulse-slow"></div>

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
              {themeColor === 'girls' ? '✨ Girls Circle sign in' : 'Private Social Circle login'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-500/25 p-3 text-xs text-rose-300 mb-5">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {forgotMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-950/40 border border-amber-500/25 p-3 text-xs text-amber-300 mb-5">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <span>{forgotMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="siva@friendhub.com"
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm glass-input font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={handleForgotClick}
                  className="text-[10px] text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl py-3 pl-10 pr-10 text-sm glass-input font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer ${
                getAccentColor().split(' ').slice(0, 2).join(' ')
              }`}
            >
              {loading ? 'Entering FriendHub...' : 'Sign In'}
            </button>

          </form>

          <div className="mt-8 text-center text-xs text-slate-500 lg:text-left">
            Have an invitation?{' '}
            <Link to="/register" className={`font-semibold hover:underline ${getAccentText()}`}>
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
