import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Shield, KeyRound, Plus, Trash2, Send, 
  Users, HardDrive, MessageCircle, BarChart3, AlertCircle,
  Copy, Share2, QrCode, Power, PowerOff, RefreshCw, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

export const AdminPanel = () => {
  const { themeColor } = useTheme();

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Broadcast announcements state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSuccess, setAnnSuccess] = useState('');

  // Invites state
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [qrModalUrl, setQrModalUrl] = useState('');

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-black shadow-pink-500/10';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  const getAccentTabStyle = (tab) => {
    if (activeTab === tab) {
      switch (themeColor) {
        case 'violet': return 'bg-violet-600/20 text-violet-300 border-b-2 border-violet-500';
        case 'emerald': return 'bg-emerald-600/20 text-emerald-300 border-b-2 border-emerald-500';
        case 'rose': return 'bg-rose-600/20 text-rose-300 border-b-2 border-rose-500';
        case 'amber': return 'bg-amber-600/20 text-amber-300 border-b-2 border-amber-500';
        case 'girls': return 'bg-pink-400/20 text-pink-300 border-b-2 border-pink-400 font-bold';
        case 'indigo':
        default: return 'bg-indigo-600/20 text-indigo-300 border-b-2 border-indigo-500';
      }
    }
    return 'text-slate-400 hover:text-white hover:bg-slate-900/30';
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, invitesRes, analyticsRes] = await Promise.all([
        api.get('/users'),
        api.get('/admin/invites'),
        api.get('/admin/analytics'),
      ]);
      setUsers(usersRes.data);
      setInvites(invitesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (e) {
      console.error('Admin loading failed:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const handleGenerateInvite = async () => {
    setInviteSuccess('');
    try {
      const res = await api.post('/admin/invite');
      setInviteSuccess(`Generated: ${res.data.code}`);
      const invitesRes = await api.get('/admin/invites');
      setInvites(invitesRes.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to generate invite');
    }
  };

  const handleDisableInvite = async (id) => {
    try {
      await api.put(`/admin/invite/${id}/disable`);
      const invitesRes = await api.get('/admin/invites');
      setInvites(invitesRes.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to disable invite');
    }
  };

  const handleRegenerateInvite = async (id) => {
    try {
      const res = await api.post(`/admin/invite/${id}/regenerate`);
      setInviteSuccess(`Regenerated to: ${res.data.code}`);
      const invitesRes = await api.get('/admin/invites');
      setInvites(invitesRes.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to regenerate invite');
    }
  };

  const handleRemoveUser = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to kick and delete "${name}" from FriendHub?`)) return;

    try {
      await api.delete(`/admin/users/${id}`);
      loadAdminData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to remove user');
    }
  };

  const handleResetPassword = async (id, name) => {
    try {
      const res = await api.post(`/admin/users/${id}/reset-password`);
      alert(`Password for "${name}" reset successfully to: ${res.data.tempPassword}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    setAnnSuccess('');
    if (!annTitle || !annMessage) return;

    try {
      await api.post('/admin/announcement', {
        title: annTitle,
        message: annMessage,
      });
      setAnnSuccess('Global announcement published successfully.');
      setAnnTitle('');
      setAnnMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Invite link copied successfully!');
  };

  const shareWhatsApp = (link) => {
    const text = encodeURIComponent(`Hey! Here is your private invitation link to join our FriendHub: ${link}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTelegram = (link) => {
    const url = encodeURIComponent(link);
    const text = encodeURIComponent('Join our private FriendHub circle!');
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  if (loading) return <Loader />;

  // Chart config
  const chartData = analytics ? {
    labels: ['Chats', 'Drive Files', 'Shared Notes', 'Game plays'],
    datasets: [
      {
        data: [
          analytics.totalMessages,
          analytics.totalFiles,
          analytics.totalNotes,
          analytics.totalScores
        ],
        backgroundColor: [
          'rgba(244, 63, 94, 0.45)',  // rose-500
          'rgba(16, 185, 129, 0.45)', // emerald-500
          'rgba(99, 102, 241, 0.45)', // indigo-500
          'rgba(168, 85, 247, 0.45)'  // purple-500
        ],
        borderColor: [
          'rgba(244, 63, 94, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(99, 102, 241, 0.85)',
          'rgba(168, 85, 247, 0.85)'
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Title */}
      <div>
        <span className="text-xs uppercase tracking-widest text-pink-400 font-bold flex items-center gap-1">
          <Shield className="h-3.5 w-3.5 text-pink-400 animate-pulse" /> Admin Command
        </span>
        <h1 className="text-2xl font-black text-white mt-1">Workspace Control Center</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900/60">
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('users')}`}>
          <Users className="h-4 w-4" /> Member Controls &amp; Invites
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('analytics')}`}>
          <BarChart3 className="h-4 w-4" /> Platform Analytics
        </button>
        <button onClick={() => setActiveTab('broadcast')} className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('broadcast')}`}>
          <Send className="h-4 w-4" /> Broadcast Announcement
        </button>
      </div>

      {/* Content views */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User management list */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-900/60 bg-slate-950/45 p-6 shadow-lg flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-3">
              <span className="text-sm font-bold text-white">Circle Friends ({users.length} / 10 limit)</span>
              <span className="text-[10px] text-pink-300 font-bold bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-900/30">
                Slots remaining: {10 - users.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {users.map((usr) => (
                <div key={usr._id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 p-3.5 hover:border-pink-500/20 hover:bg-slate-900/30 transition-all">
                  <div className="flex items-center gap-3">
                    <img
                      src={usr.avatar || 'https://via.placeholder.com/150'}
                      alt="Avatar"
                      className="h-9 w-9 rounded-xl object-cover border border-slate-800"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200">{usr.username}</span>
                      <span className="text-[10px] text-slate-500 capitalize leading-normal">Role: {usr.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResetPassword(usr._id, usr.username)}
                      className="rounded-xl p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Reset Password to Default"
                    >
                      <KeyRound className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveUser(usr._id, usr.username)}
                      className="rounded-xl p-2.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Kick User"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invites generation and history */}
          <div className="rounded-3xl border border-slate-900/60 bg-slate-950/45 p-6 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white border-b border-slate-900/60 pb-3">Invite Link Management</span>
            
            <button
              onClick={handleGenerateInvite}
              disabled={users.length >= 10}
              className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${getAccentBtn()}`}
            >
              <Plus className="h-4.5 w-4.5" /> Create Invite Link
            </button>

            {inviteSuccess && (
              <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-3 text-center text-[10px] font-bold text-pink-300 animate-pulse">
                {inviteSuccess}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Invite Codes History</span>
              
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                {invites.length === 0 ? (
                  <span className="text-[10px] text-slate-500 italic">No invites generated yet.</span>
                ) : (
                  invites.map((inv) => {
                    const inviteUrl = `${window.location.origin}/invite/${inv.code}`;
                    const isExpired = new Date(inv.expiresAt) < new Date();
                    
                    return (
                      <div key={inv._id} className="rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-xs text-slate-200">{inv.code}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            inv.isUsed ? 'bg-slate-800 text-slate-400' :
                            isExpired ? 'bg-rose-950/40 text-rose-400 border border-rose-900/20' :
                            !inv.isActive ? 'bg-slate-900 text-slate-500' :
                            'bg-emerald-950 text-emerald-400'
                          }`}>
                            {inv.isUsed ? 'Used' : isExpired ? 'Expired' : !inv.isActive ? 'Inactive' : 'Active'}
                          </span>
                        </div>

                        {inv.isUsed && (
                          <div className="text-[9.5px] text-slate-500 font-medium">
                            Claimed by: <span className="text-pink-300 font-bold">@{inv.usedBy?.username}</span>
                          </div>
                        )}

                        {!inv.isUsed && (
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[9.5px] text-slate-500 leading-normal truncate block">
                              Link: {inviteUrl}
                            </span>
                            
                            {/* Copy/Share links */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => copyToClipboard(inviteUrl)}
                                className="rounded-lg p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Copy Link"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => shareWhatsApp(inviteUrl)}
                                className="rounded-lg p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                title="Share on WhatsApp"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setQrModalUrl(inviteUrl)}
                                className="rounded-lg p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-pink-300 transition-colors cursor-pointer"
                                title="Show QR Code"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                              </button>
                              
                              {/* Revoke/Regenerate Controls */}
                              {inv.isActive && !isExpired && (
                                <button
                                  onClick={() => handleDisableInvite(inv._id)}
                                  className="rounded-lg p-2 bg-slate-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-auto"
                                  title="Disable Link"
                                >
                                  <PowerOff className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {(isExpired || !inv.isActive) && (
                                <button
                                  onClick={() => handleRegenerateInvite(inv._id)}
                                  className="rounded-lg p-2 bg-slate-900 hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer ml-auto"
                                  title="Regenerate & Extend"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Charts representation */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-900/60 bg-slate-950/45 p-6 shadow-lg flex flex-col gap-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Workspace Database breakdown</span>
            <div className="h-64 w-full flex items-center justify-center">
              {chartData && <Doughnut data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } } } } }} />}
            </div>
          </div>

          {/* Statistic Counters */}
          <div className="flex flex-col gap-4">
            
            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-4.5 flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 text-rose-450 border border-slate-800">
                <Users className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Members</span>
                <span className="text-xl font-mono font-black text-slate-200 mt-0.5">{analytics.totalUsers} / 10 slots</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-4.5 flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 text-indigo-400 border border-slate-800">
                <MessageCircle className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Shared Chats</span>
                <span className="text-xl font-mono font-black text-slate-200 mt-0.5">{analytics.totalMessages} posts</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-4.5 flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 text-emerald-400 border border-slate-800">
                <HardDrive className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Drive Files</span>
                <span className="text-xl font-mono font-black text-slate-200 mt-0.5">{analytics.totalFiles} files</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="rounded-3xl border border-slate-900/60 bg-slate-950/45 p-6 shadow-lg max-w-xl">
          <span className="text-sm font-bold text-white border-b border-slate-900/60 pb-3 block">Publish Global Alert Broadcast</span>
          
          <form onSubmit={handleSendAnnouncement} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Broadcast Title</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Alert title..."
                className="w-full rounded-xl py-3 px-4 text-sm glass-input font-medium"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Broadcast Message</label>
              <textarea
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Alert details to show on everyone's notifications panel..."
                className="w-full rounded-xl py-3 px-4 text-sm glass-input font-medium h-28 resize-none"
                required
              />
            </div>

            {annSuccess && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-center text-xs font-bold text-emerald-400 animate-pulse">
                {annSuccess}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer ${getAccentBtn()}`}
            >
              <Send className="h-4.5 w-4.5" /> Publish Announcement
            </button>
          </form>
        </div>
      )}

      {/* QR Code Modal Popup */}
      {qrModalUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-card border border-white/10 p-6 flex flex-col items-center gap-4 relative">
            <button
              onClick={() => setQrModalUrl('')}
              className="absolute top-4 right-4 rounded-xl p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <span className="text-xs text-pink-400 font-black uppercase tracking-wider mt-2">QR Invitation Code</span>
            
            {/* Direct loading of QR Code from official free server, avoiding external packages */}
            <div className="rounded-2xl bg-white p-4 border border-pink-500/20">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrModalUrl)}`}
                alt="QR Code Invite Link"
                className="h-40 w-40 object-contain"
              />
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Show this QR code to your friend to scan. It will automatically redirect them to the registration page.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
