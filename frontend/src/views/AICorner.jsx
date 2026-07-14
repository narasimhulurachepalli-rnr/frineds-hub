import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Brain, Send, FileText, CheckSquare, 
  Code2, HelpCircle, Terminal, User, Sparkles
} from 'lucide-react';

export const AICorner = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const [activeMode, setActiveMode] = useState('general'); // 'general' | 'resume' | 'grammar' | 'code-explain' | 'interview'
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "### 👋 Hello Friend! I'm FriendBot, your AI Workspace Assistant\n\nI'm ready to collaborate. What are we building today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-750 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-755 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-755 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-755 text-white';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-755 text-white';
    }
  };

  const getAccentSidebar = (mode) => {
    if (activeMode === mode) {
      switch (themeColor) {
        case 'violet': return 'bg-violet-600/20 text-violet-300 border-l-2 border-violet-500';
        case 'emerald': return 'bg-emerald-600/20 text-emerald-300 border-l-2 border-emerald-500';
        case 'rose': return 'bg-rose-600/20 text-rose-300 border-l-2 border-rose-500';
        case 'amber': return 'bg-amber-600/20 text-amber-300 border-l-2 border-amber-500';
        case 'girls': return 'bg-pink-400/20 text-pink-300 border-l-2 border-pink-300 font-bold';
        case 'indigo':
        default: return 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500';
      }
    }
    return 'text-slate-400 hover:bg-slate-900/60 hover:text-white';
  };

  const getModeTitle = () => {
    switch (activeMode) {
      case 'resume': return 'Resume critique';
      case 'grammar': return 'Grammar checker';
      case 'code-explain': return 'Code explainer';
      case 'interview': return 'Interview helper';
      case 'general':
      default: return 'General assistant';
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userPrompt }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', {
        prompt: userPrompt,
        type: activeMode,
      });

      setMessages((prev) => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "❌ Sorry, I encountered an error answering your prompt. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render simple markdown on client
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    let insideCodeBlock = false;
    let codeBlockContent = [];

    return lines.map((line, idx) => {
      // Toggle code block parsing
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          insideCodeBlock = false;
          const code = codeBlockContent.join('\n');
          codeBlockContent = [];
          return (
            <pre key={idx} className="rounded-xl bg-slate-950 border border-slate-900 p-4 text-[10px] text-indigo-300 font-mono overflow-x-auto leading-normal my-2">
              <code>{code}</code>
            </pre>
          );
        } else {
          insideCodeBlock = true;
          return null;
        }
      }

      if (insideCodeBlock) {
        codeBlockContent.push(line);
        return null;
      }

      // Headers parsing
      if (line.startsWith('###')) {
        return <h3 key={idx} className="text-sm font-extrabold text-white mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
      }
      if (line.startsWith('##')) {
        return <h2 key={idx} className="text-base font-extrabold text-white mt-4 mb-2">{line.replace('##', '').trim()}</h2>;
      }

      // Bold text replacements
      let content = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const elements = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        const textBefore = line.substring(lastIndex, match.index);
        const boldText = match[1];
        
        if (textBefore) elements.push(textBefore);
        elements.push(<strong key={match.index} className="text-slate-200 font-black">{boldText}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      const textAfter = line.substring(lastIndex);
      if (textAfter) elements.push(textAfter);

      // Lists
      if (line.trim().startsWith('*')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 leading-relaxed py-0.5">
            {elements.length > 0 ? elements : line.replace('*', '').trim()}
          </li>
        );
      }

      return (
        <p key={idx} className="leading-relaxed text-slate-300 py-1 font-light">
          {elements.length > 0 ? elements : line}
        </p>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-3xl border border-slate-900 bg-slate-950/45 shadow-xl overflow-hidden">
      
      {/* Side panel controls */}
      <div className="hidden md:flex flex-col w-56 border-r border-slate-900 bg-slate-950/80 p-4">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-3">AI Services</span>
        <div className="flex flex-col gap-1">
          {[
            { id: 'general', name: 'General Chat', icon: <Brain className="h-4.5 w-4.5" /> },
            { id: 'resume', name: 'Resume Critique', icon: <FileText className="h-4.5 w-4.5" /> },
            { id: 'grammar', name: 'Grammar Checker', icon: <CheckSquare className="h-4.5 w-4.5" /> },
            { id: 'code-explain', name: 'Code Explainer', icon: <Code2 className="h-4.5 w-4.5" /> },
            { id: 'interview', name: 'Interview Simulator', icon: <HelpCircle className="h-4.5 w-4.5" /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                // Seed initial mode greetings
                setMessages([
                  {
                    sender: 'bot',
                    text: mode.id === 'general' ? "### 👋 Hello Friend! I'm FriendBot\n\nHow can I help you today?" :
                          mode.id === 'resume' ? "### 📄 Resume Critique Assistant\n\nPaste/type your resume sections here for placement critique." :
                          mode.id === 'grammar' ? "### ✍️ Spelling & Grammar Correction Board\n\nEnter text to correct grammar instantly." :
                          mode.id === 'code-explain' ? "### 💻 JavaScript Code Explainer\n\nPaste your code snippet and I will break down the scoping!" :
                          "### 💡 Placement Technical Interview Board\n\nRequest an interview drill for frontend React roles!"
                  }
                ]);
              }}
              className={`text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-2.5 ${getAccentSidebar(mode.id)}`}
            >
              {mode.icon}
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main conversational workspace */}
      <div className="flex-grow flex flex-col h-full bg-slate-950/20">
        
        {/* Header bar */}
        <div className="h-14 border-b border-slate-900 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></div>
            <span className="text-sm font-bold text-white uppercase tracking-wide capitalize">{getModeTitle()}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">FriendBot Workspace</span>
        </div>

        {/* Message feed timeline */}
        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-5">
          {messages.map((msg, i) => {
            const isBot = msg.sender === 'bot';
            return (
              <div key={i} className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}>
                {/* Avatar icons */}
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isBot ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {isBot ? <Sparkles className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                </div>

                <div className={`rounded-2xl p-4 text-xs shadow-md border ${
                  isBot ? 'bg-slate-950/90 border-slate-900' : 'bg-slate-900/80 border-slate-850 text-slate-200'
                }`}>
                  {isBot ? renderFormattedText(msg.text) : <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                </div>
              </div>
            );
          })}

          {/* Thoughts loader */}
          {loading && (
            <div className="flex gap-3 self-start max-w-[80%]">
              <div className="h-8 w-8 rounded-xl bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 flex items-center justify-center animate-pulse">
                <Brain className="h-4.5 w-4.5 animate-spin-slow" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-slate-950 border border-slate-900 flex items-center gap-1.5 text-xs text-slate-500 italic">
                FriendBot is thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input prompt form */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-900 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask FriendBot (${getModeTitle()})...`}
            className="flex-grow rounded-xl py-3 px-4 text-xs glass-input font-medium"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`rounded-xl p-3 shadow-md flex items-center justify-center cursor-pointer disabled:opacity-50 ${getAccentBtn()}`}
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>

      </div>

    </div>
  );
};

export default AICorner;
