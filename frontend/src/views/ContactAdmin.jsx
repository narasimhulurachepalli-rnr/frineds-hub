import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Mail, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';

export const ContactAdmin = () => {
  const { themeColor } = useTheme();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !message) return;
    
    // Simulate sending admin tickets
    setSuccess(true);
    setSubject('');
    setMessage('');
    setContactEmail('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="max-w-md mx-auto rounded-3xl border border-slate-900 bg-slate-950/45 p-6 md:p-8 shadow-xl flex flex-col gap-5">
      
      <div className="border-b border-slate-900 pb-3 flex items-center gap-3">
        <Mail className="h-5.5 w-5.5 text-indigo-400" />
        <div>
          <h1 className="text-base font-extrabold text-white">Contact Administrator</h1>
          <p className="text-[10px] text-slate-500 mt-0.5">Submit request help queries to group admin.</p>
        </div>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0" />
          <span>Ticket submitted successfully! The Admin has been notified.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400">Your Email Address</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="siva@friendhub.com"
            className="w-full rounded-xl py-2.5 px-3 glass-input font-medium"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400">Subject / Category</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Account restoration or Password resets"
            className="w-full rounded-xl py-2.5 px-3 glass-input font-medium"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400">Message Description</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Detailed details of your issue..."
            className="w-full rounded-xl py-2.5 px-3 glass-input font-medium min-h-24 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-xl font-bold transition-all shadow-md mt-1 cursor-pointer ${getAccentBtn()}`}
        >
          Submit Support Request
        </button>

      </form>

    </div>
  );
};

export default ContactAdmin;
