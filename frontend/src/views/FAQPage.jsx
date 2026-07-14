import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "How secure are my shared notes, drive files, and chats?",
    a: "FriendHub runs behind a JSON Web Token authentication system. Every API route checks for user headers validity. File shares are stored on the server disk with randomized suffixes, preventing raw guess access. The database runs Mongo sanitizers to block injections."
  },
  {
    q: "What is the maximum upload limit per file?",
    a: "The backend server allows uploading notes, PDFs, code archives, videos, or trip pictures up to 100MB per file. Attempting uploads beyond this limit will result in an size-overflow rejection."
  },
  {
    q: "How do login streaks and leaderboard points work?",
    a: "Daily login streaks track consecutive calendar days you connect. Logging in yesterday increments it; missing a day resets it to 1. Leaderboard points are computed using a gamified formula: Quiz Score total + loginStreak*10 + chats*2 + uploads*15 + arcadeWins*20."
  },
  {
    q: "Can I invite someone outside our group of 10 friends?",
    a: "No. The system database validates the total user count on every register trigger. Once 10 users register, signups close permanently, regardless of whether invite codes are generated."
  }
];

export const FAQPage = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-slate-900 bg-slate-950/45 p-6 md:p-8 shadow-xl flex flex-col gap-5">
      
      <div className="border-b border-slate-900 pb-4 mb-2 flex items-center gap-3">
        <HelpCircle className="h-6 w-6 text-indigo-400" />
        <div>
          <h1 className="text-xl font-extrabold text-white">Frequently Asked Questions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quick guides to understanding FriendHub features.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => {
          const isOpen = openIdx === index;
          return (
            <div key={index} className="rounded-xl border border-slate-900 bg-slate-900/10 overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : index)}
                className="w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold text-slate-200 hover:bg-slate-900/20"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1.5 border-t border-slate-900/60 text-xs text-slate-400 leading-relaxed font-light">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default FAQPage;
