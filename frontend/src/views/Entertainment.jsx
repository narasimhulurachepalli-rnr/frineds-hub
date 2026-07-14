import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Sparkles, Smile, RefreshCcw, Heart, Send, 
  Trash2, HelpCircle, Check, Vote, AlertCircle, Plus, Music, Film, Shuffle
} from 'lucide-react';

const spinChoices = [
  "Truth 🫢",
  "Dare 😈",
  "Sing a Song 🎤",
  "Drink Water 💧",
  "Tell a Secret 🤫",
  "Spin Again 🔄",
  "Do 10 Pushups 💪",
  "Imitate Someone 🎭"
];

const mockDailyChallenges = [
  "🐍 Beat the current top score in the Snake arcade game!",
  "📸 Upload a funny throw-back memory photo from college to the memories album.",
  "📣 Create a new group poll deciding the next trip location."
];

export const Entertainment = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const [activeTab, setActiveTab] = useState('wheel');
  const [loading, setLoading] = useState(false);

  // Truth or Dare states
  const [tdPrompt, setTdPrompt] = useState(null);
  const [tdType, setTdType] = useState('truth');

  // Jokes state
  const [joke, setJoke] = useState("Click the button to generate a funny developer joke!");

  // Recommendations state
  const [recs, setRecs] = useState([]);
  const [recTitle, setRecTitle] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recType, setRecType] = useState('movie');
  const [recLink, setRecLink] = useState('');

  // Polls state
  const [polls, setPolls] = useState([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [showPollForm, setShowPollForm] = useState(false);

  // Spin Wheel states
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState('');

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

  const fetchPolls = async () => {
    try {
      const res = await api.get('/polls');
      setPolls(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecs = async () => {
    try {
      const res = await api.get('/entertainment/recs');
      setRecs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'polls') fetchPolls();
    if (activeTab === 'recs') fetchRecs();
  }, [activeTab]);

  // Truth or Dare puller
  const handleGetTD = async (type) => {
    setLoading(true);
    setTdType(type);
    try {
      const res = await api.get(`/entertainment/truth-or-dare?type=${type}`);
      setTdPrompt(res.data.prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Joke generator
  const handleGetJoke = async () => {
    setLoading(true);
    try {
      const res = await api.get('/entertainment/jokes');
      setJoke(res.data.joke);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Recommendation poster
  const handleAddRec = async (e) => {
    e.preventDefault();
    if (!recTitle) return;

    try {
      await api.post('/entertainment/recs', {
        title: recTitle,
        description: recDesc,
        type: recType,
        link: recLink,
      });
      setRecTitle('');
      setRecDesc('');
      setRecLink('');
      fetchRecs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeRec = async (id) => {
    try {
      await api.post(`/entertainment/recs/${id}/like`);
      fetchRecs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRec = async (id) => {
    if (!window.confirm('Remove recommendation?')) return;
    try {
      await api.delete(`/entertainment/recs/${id}`);
      fetchRecs();
    } catch (err) {
      console.error(err);
    }
  };

  // Polls logic
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanOpts = pollOptions.filter((o) => o.trim().length > 0);
    if (!pollQuestion || cleanOpts.length < 2) return;

    try {
      await api.post('/polls', {
        question: pollQuestion,
        options: cleanOpts,
        expiresDays: 7,
      });
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPollForm(false);
      fetchPolls();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionId });
      fetchPolls();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Delete this poll?')) return;
    try {
      await api.delete(`/polls/${pollId}`);
      fetchPolls();
    } catch (err) {
      console.error(err);
    }
  };

  // Spin Wheel action
  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSpinResult('');
    
    // Choose sector index (0 to 7)
    const sectorIdx = Math.floor(Math.random() * spinChoices.length);
    const degreesPerSector = 360 / spinChoices.length;
    
    // Spin 4-5 full rotations (1440 - 1800 deg) plus targeting degrees
    const extraRotations = (4 + Math.floor(Math.random() * 2)) * 360;
    const targetDegrees = 360 - (sectorIdx * degreesPerSector) - (degreesPerSector / 2);
    const newRotation = rotation + extraRotations + targetDegrees;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(spinChoices[sectorIdx]);
    }, 4000); // matching animation length in CSS transition
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Group Hangout</span>
        <h1 className="text-2xl font-extrabold text-white mt-1">Entertainment Center</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900">
        <button onClick={() => setActiveTab('wheel')} className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('wheel')}`}>
          <Shuffle className="h-4 w-4" /> Spin &amp; Truth/Dare
        </button>
        <button onClick={() => setActiveTab('polls')} className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('polls')}`}>
          <Vote className="h-4 w-4" /> Group Polls
        </button>
        <button onClick={() => setActiveTab('recs')} className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('recs')}`}>
          <Film className="h-4 w-4" /> Movie &amp; Song Recs
        </button>
        <button onClick={() => setActiveTab('challenges')} className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('challenges')}`}>
          <Smile className="h-4 w-4" /> Jokes &amp; Challenge
        </button>
      </div>

      {/* Content views */}
      {activeTab === 'wheel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Spin Wheel Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-6 shadow-lg flex flex-col items-center gap-6">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Interactive Spin Wheel</span>
            
            {/* SVG Wheel Box */}
            <div className="relative h-64 w-64 md:h-72 md:w-72 flex items-center justify-center">
              
              {/* Target Pointer */}
              <div className="absolute top-0 z-20 h-0 w-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-rose-500"></div>

              {/* Rotatable wheel */}
              <svg
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none',
                }}
                className="h-full w-full rounded-full border-4 border-slate-800 shadow-2xl bg-slate-900"
                viewBox="0 0 200 200"
              >
                {/* 8 sectors */}
                {spinChoices.map((choice, i) => {
                  const angle = 45;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;
                  
                  // Compute SVG paths for sectors
                  const radStart = (startAngle - 90) * (Math.PI / 180);
                  const radEnd = (endAngle - 90) * (Math.PI / 180);
                  
                  const x1 = 100 + 100 * Math.cos(radStart);
                  const y1 = 100 + 100 * Math.sin(radStart);
                  const x2 = 100 + 100 * Math.cos(radEnd);
                  const y2 = 100 + 100 * Math.sin(radEnd);

                  const textAngle = startAngle + (angle / 2);
                  const radText = (textAngle - 90) * (Math.PI / 180);
                  const tx = 100 + 60 * Math.cos(radText);
                  const ty = 100 + 60 * Math.sin(radText);

                  const colors = [
                    '#1e1b4b', '#2e1065', '#0f172a', '#022c22',
                    '#111827', '#030712', '#180020', '#0a0f20'
                  ];

                  return (
                    <g key={i}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                        fill={colors[i % colors.length]}
                        stroke="#1e293b"
                        strokeWidth="0.8"
                      />
                      <text
                        x={tx}
                        y={ty}
                        fill="#cbd5e1"
                        fontSize="6"
                        fontWeight="bold"
                        textAnchor="middle"
                        transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                      >
                        {choice.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
                {/* Center peg */}
                <circle cx="100" cy="100" r="10" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
              </svg>

              {/* Center button overlays */}
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="absolute h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs border-2 border-white shadow-lg cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                SPIN
              </button>
            </div>

            {/* Results display */}
            {spinResult && (
              <div className="rounded-xl px-4 py-2 border border-emerald-500/25 bg-emerald-500/10 text-xs font-bold text-emerald-400 animate-bounce mt-2 text-center">
                Target Selected: {spinResult}
              </div>
            )}
          </div>

          {/* Truth or Dare drawer */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-6 shadow-lg flex flex-col gap-6 items-center text-center">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Truth or Dare Generator</span>
            
            <div className="flex gap-4">
              <button
                onClick={() => handleGetTD('truth')}
                className="rounded-xl bg-violet-600 hover:bg-violet-750 px-5 py-3 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                🫢 Truth card
              </button>
              <button
                onClick={() => handleGetTD('dare')}
                className="rounded-xl bg-rose-600 hover:bg-rose-755 px-5 py-3 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                😈 Dare card
              </button>
            </div>

            {/* Card output container */}
            {tdPrompt ? (
              <div className={`w-full max-w-sm rounded-2xl border p-6 bg-slate-900/40 border-slate-800 shadow-inner flex flex-col gap-3 min-h-24 justify-center`}>
                <span className={`text-[10px] font-bold uppercase ${tdType === 'truth' ? 'text-violet-400' : 'text-rose-400'}`}>
                  {tdType} prompt
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  "{tdPrompt}"
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-10">
                Click a button above to pull a card!
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'polls' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Poll form/creator column */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-sm font-bold text-white">Create Group Poll</span>
              <button
                onClick={() => setShowPollForm(!showPollForm)}
                className="text-xs text-indigo-400 hover:underline"
              >
                {showPollForm ? 'Hide Form' : 'Show Form'}
              </button>
            </div>

            {showPollForm && (
              <form onSubmit={handleCreatePoll} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Question</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="e.g. Where should we go next weekend?"
                    className="w-full rounded-xl p-2.5 text-xs glass-input font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400 font-semibold flex justify-between">
                    <span>Options</span>
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      + Add Option
                    </button>
                  </label>
                  {pollOptions.map((opt, index) => (
                    <input
                      key={index}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...pollOptions];
                        copy[index] = e.target.value;
                        setPollOptions(copy);
                      }}
                      placeholder={`Choice ${index + 1}`}
                      className="w-full rounded-xl p-2.5 text-xs glass-input font-medium"
                      required={index < 2}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${getAccentBtn()}`}
                >
                  Publish Poll
                </button>
              </form>
            )}
          </div>

          {/* Active Polls display list */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-5">
            <span className="text-sm font-bold text-white border-b border-slate-900 pb-2">Active Polls</span>
            
            <div className="flex flex-col gap-5 overflow-y-auto">
              {polls.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 italic">
                  No active polls. Create one!
                </div>
              ) : (
                polls.map((poll) => {
                  const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
                  return (
                    <div key={poll._id} className="rounded-xl border border-slate-900 bg-slate-900/10 p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{poll.question}</h4>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            Created by: {poll.creator?.username} &bull; Total votes: {totalVotes}
                          </span>
                        </div>
                        {(poll.creator?._id === user._id || user.role === 'Admin') && (
                          <button
                            onClick={() => handleDeletePoll(poll._id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        {poll.options.map((opt) => {
                          const votesCount = opt.votes?.length || 0;
                          const pct = totalVotes > 0 ? ((votesCount / totalVotes) * 100).toFixed(0) : 0;
                          const hasVoted = opt.votes?.includes(user._id);

                          return (
                            <button
                              key={opt._id}
                              onClick={() => handleVote(poll._id, opt._id)}
                              className={`w-full text-left rounded-xl p-3 relative overflow-hidden border transition-all text-xs flex justify-between items-center ${
                                hasVoted 
                                  ? 'border-indigo-500 bg-indigo-950/20 text-white font-bold' 
                                  : 'border-slate-850 hover:bg-slate-900/30 text-slate-300'
                              }`}
                            >
                              {/* Filled progress bar background */}
                              <div
                                style={{ width: `${pct}%` }}
                                className="absolute left-0 top-0 bottom-0 bg-indigo-600/10 z-0 transition-all duration-500"
                              />

                              <span className="z-10">{opt.text}</span>
                              <span className="z-10 text-[10px] text-slate-500 font-semibold font-mono">
                                {votesCount} votes ({pct}%)
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'recs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Post Recommendation Form */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white border-b border-slate-900 pb-2">Recommend Song/Movie</span>
            <form onSubmit={handleAddRec} className="flex flex-col gap-4 mt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Title</label>
                <input
                  type="text"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="e.g. Interstellar (2014)"
                  className="w-full rounded-xl p-2.5 text-xs glass-input font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Description / Notes</label>
                <textarea
                  value={recDesc}
                  onChange={(e) => setRecDesc(e.target.value)}
                  placeholder="Why do you recommend this?"
                  className="w-full rounded-xl p-2.5 text-xs glass-input font-medium min-h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Type</label>
                  <select
                    value={recType}
                    onChange={(e) => setRecType(e.target.value)}
                    className="w-full rounded-xl p-2.5 text-xs bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                  >
                    <option value="movie">Movie</option>
                    <option value="song">Song</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Link (Spotify / IMDB)</label>
                  <input
                    type="url"
                    value={recLink}
                    onChange={(e) => setRecLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl p-2.5 text-xs glass-input font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${getAccentBtn()}`}
              >
                Share Recommendation
              </button>
            </form>
          </div>

          {/* List display */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white border-b border-slate-900 pb-2">Shared Board</span>
            
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[420px]">
              {recs.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 italic">
                  No recommendations posted yet.
                </div>
              ) : (
                recs.map((rec) => {
                  const isLiked = rec.likes?.includes(user._id);
                  return (
                    <div key={rec._id} className="rounded-xl border border-slate-900 bg-slate-900/10 p-3.5 flex justify-between items-start gap-2">
                      <div className="flex gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 text-indigo-400 border border-slate-850 flex-shrink-0 mt-0.5">
                          {rec.type === 'movie' ? <Film className="h-5 w-5" /> : <Music className="h-5 w-5" />}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-200">{rec.title}</span>
                            {rec.link && (
                              <a
                                href={rec.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] text-indigo-400 hover:underline"
                              >
                                View Link
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 font-light leading-relaxed">{rec.description}</p>
                          <span className="text-[9px] text-slate-500 mt-2 block leading-normal">
                            Recommended by: {rec.recommendedBy?.username}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLikeRec(rec._id)}
                          className={`flex items-center gap-1 text-[10px] font-bold ${
                            isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          {rec.likes?.length || 0}
                        </button>
                        {(rec.recommendedBy?._id === user._id || user.role === 'Admin') && (
                          <button
                            onClick={() => handleDeleteRec(rec._id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Challenge Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white border-b border-slate-900 pb-2">Daily Challenges</span>
            <div className="flex flex-col gap-3">
              {mockDailyChallenges.map((ch, idx) => (
                <div key={idx} className="rounded-xl border border-slate-900 bg-slate-900/20 p-3.5 text-xs text-slate-300 font-medium leading-relaxed">
                  {ch}
                </div>
              ))}
            </div>
          </div>

          {/* Jokes Generator */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950/45 p-6 shadow-lg flex flex-col gap-4 items-center text-center">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Humor / Joke Generator</span>
            <div className="rounded-xl border p-5 bg-slate-900/40 border-slate-800 shadow-inner flex flex-col justify-center min-h-24 max-w-md w-full">
              <p className="text-xs text-slate-200 leading-relaxed font-semibold italic">
                "{joke}"
              </p>
            </div>

            <button
              onClick={handleGetJoke}
              disabled={loading}
              className={`rounded-xl px-5 py-3 text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5 mt-2 cursor-pointer ${getAccentBtn()}`}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Tell Me a Joke
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Entertainment;
