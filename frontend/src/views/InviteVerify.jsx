import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { ShieldAlert, Mail } from 'lucide-react';

export const InviteVerify = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const res = await api.get(`/auth/invite/validate/${code}`);
        if (res.data.valid) {
          // Store valid invite code in session storage
          sessionStorage.setItem('inviteCode', code);
          // Redirect to register
          navigate(`/register?code=${code}`);
        } else {
          setErrorMsg(res.data.message || 'This invitation is invalid or expired.');
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Invalid or expired invitation link. Please request a new invite from the Admin.');
      } finally {
        setLoading(false);
      }
    };

    checkInvite();
  }, [code, navigate]);

  if (loading) return <Loader fullPage />;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#030712] overflow-hidden animated-bg">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-rose-600/10 blur-[80px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-[80px]"></div>

      <div className="relative w-full max-w-md p-8 rounded-3xl glass-card text-center border border-white/5 shadow-2xl relative">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mb-6 animate-pulse">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-extrabold text-white">Oops! Invite Blocked</h2>
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          {errorMsg}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="mailto:admin@friendhub.com"
            className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Mail className="h-4 w-4" /> Email Group Administrator
          </a>
        </div>
      </div>
    </div>
  );
};

export default InviteVerify;
