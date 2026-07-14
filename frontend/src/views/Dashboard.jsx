import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, Sun, Cloud, CloudRain, Snowflake, Flame, 
  Users, Quote, Calendar as CalIcon, ArrowRight, Lightbulb, 
  RefreshCw, Play, Pause, Smile, Heart, Laugh, PartyPopper
} from 'lucide-react';

const quotes = [
  { text: "Friends are the siblings God never gave us.", author: "Mencius" },
  { text: "A single rose can be my garden... a single friend, my world.", author: "Leo Buscaglia" },
  { text: "Rare as is true love, true friendship is rarer.", author: "Jean de La Fontaine" },
  { text: "Good friends, good books, and a sleepy conscience: this is the ideal life.", author: "Mark Twain" }
];

export const Dashboard = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const { themeColor } = useTheme();

  const [time, setTime] = useState(new Date());
  const [usersList, setUsersList] = useState([]);
  const [events, setEvents] = useState([]);
  const [quote, setQuote] = useState(quotes[0]);
  
  // Weather state
  const [city, setCity] = useState('Hyderabad');
  const [weather, setWeather] = useState({ temp: 31, condition: 'Sunny' });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Lofi player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [lofiTrack, setLofiTrack] = useState('Sakura Dreams Lofi 🌸');
  
  // Emoji reaction counters
  const [sparklesCount, setSparklesCount] = useState(12);
  const [heartsCount, setHeartsCount] = useState(19);
  const [laughsCount, setLaughsCount] = useState(8);
  const [partiesCount, setPartiesCount] = useState(15);

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'girls': return 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-black shadow-lg shadow-pink-500/15';
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

  const getAccentBg = () => {
    switch (themeColor) {
      case 'violet': return 'from-violet-500/20 to-purple-500/10 border-violet-500/30';
      case 'emerald': return 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30';
      case 'rose': return 'from-rose-500/20 to-pink-500/10 border-rose-500/30';
      case 'amber': return 'from-amber-500/20 to-yellow-500/10 border-amber-500/30';
      case 'girls': return 'from-pink-300/30 to-purple-400/15 border-pink-400/40 shadow-lg';
      case 'indigo':
      default: return 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30';
    }
  };

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Rotate quote hourly
    const quoteInterval = setInterval(() => {
      const idx = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[idx]);
    }, 60000);

    const loadDashboardData = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          api.get('/users'),
          api.get('/events'),
        ]);
        setUsersList(usersRes.data);
        
        // Sort and limit events to next 2
        const sorted = eventsRes.data
          .filter((e) => new Date(e.start) >= new Date())
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, 2);
        setEvents(sorted);
      } catch (err) {
        console.error('Dashboard fetching error:', err);
      }
    };

    loadDashboardData();
    return () => {
      clearInterval(timer);
      clearInterval(quoteInterval);
    };
  }, []);

  const changeWeather = () => {
    setIsWeatherLoading(true);
    setTimeout(() => {
      const cities = ['Hyderabad', 'Vizag', 'Bangalore', 'Mumbai'];
      const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Breezy'];
      
      const newCity = cities[Math.floor(Math.random() * cities.length)];
      const cond = conditions[Math.floor(Math.random() * conditions.length)];
      
      setCity(newCity);
      let temp = 30;
      if (cond === 'Sunny') temp = 34;
      else if (cond === 'Rainy') temp = 24;
      else if (cond === 'Cloudy') temp = 28;
      else temp = 27;

      setWeather({ temp, condition: cond });
      setIsWeatherLoading(false);
    }, 450);
  };

  const getWeatherIcon = (cond) => {
    switch (cond) {
      case 'Sunny': return (
        <div className="relative">
          <Sun className="h-10 w-10 text-amber-400 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 text-xs select-none">😊</span>
        </div>
      );
      case 'Rainy': return <CloudRain className="h-10 w-10 text-sky-400" />;
      case 'Cloudy': return <Cloud className="h-10 w-10 text-pink-300" />;
      case 'Breezy':
      default: return <Snowflake className="h-10 w-10 text-indigo-300" />;
    }
  };

  // Find users having birthday today
  const bdaysToday = usersList.filter((u) => {
    if (!u.birthday) return false;
    const bday = new Date(u.birthday);
    const today = new Date();
    return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
  });

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Top Banner (Kawaii Hero Card) */}
      <div className={`rounded-3xl p-6 md:p-8 border bg-gradient-to-br shadow-xl transition-all relative overflow-hidden ${getAccentBg()}`}>
        {/* Floating cherry blossom ribbons inside the card background */}
        <div className="absolute top-0 right-0 p-4 pointer-events-none select-none opacity-20 text-6xl hidden md:block">🌸</div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
          <div className="flex items-start gap-4">
            <span className="text-5xl bunny-wave select-none mt-1">🐰</span>
            <div>
              <span className="text-xs uppercase tracking-widest text-pink-400 font-black flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" /> {themeColor === 'girls' ? '✨ Girls Aesthetic Workspace ✨' : 'Workspace Dashboard'}
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {themeColor === 'girls' ? (
                  <>
                    Hello gorgeous <span className={`${getAccentText()}`}>{user?.username}</span> 👑💅!
                  </>
                ) : (
                  <>
                    Welcome back, <span className={`${getAccentText()}`}>{user?.username}</span>!
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-2.5 max-w-lg leading-relaxed">
                {themeColor === 'girls'
                  ? 'Check on your circle events, share lovely photo stories, chat with lofi beats, or ask your AI friend helper!'
                  : 'Stay connected with your close group. Share study notes, play games, schedule matches, and make memories.'}
              </p>
            </div>
          </div>

          {/* Time & Streak widget container */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 self-stretch md:self-auto justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-2xl font-black font-mono tracking-tight text-white">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
              <Flame className="h-8 w-8 text-pink-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-pink-400">{user?.loginStreak || 1}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Streak Days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Double Columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Quick Access widgets row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weather Card */}
            <div className="glass-card-kawaii border-emerald-250/60 dark:border-emerald-500/20 hover:border-emerald-400/80 p-6 flex justify-between items-center relative overflow-hidden group">
              {/* Floating Leaf Particles */}
              <div className="absolute top-2 right-12 text-[10px] opacity-15 rotate-12 select-none pointer-events-none">🍃</div>
              
              <div className="flex flex-col gap-1.5 z-10">
                <span className="text-[10px] text-pink-400 font-black uppercase tracking-wider">Local Weather</span>
                <span className="text-2xl font-extrabold text-slate-100">{city}</span>
                <span className="text-xs text-slate-400 font-medium capitalize">{weather.condition} &bull; {weather.temp}°C</span>
              </div>
              <div className="flex flex-col items-center gap-2 z-10">
                {getWeatherIcon(weather.condition)}
                <button
                  onClick={changeWeather}
                  disabled={isWeatherLoading}
                  className="rounded-xl p-2 bg-slate-900/60 border border-slate-800 hover:bg-slate-800 transition-all text-slate-400 hover:text-pink-300 cursor-pointer"
                  title="Refresh Weather"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isWeatherLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="glass-card-kawaii border-purple-250/60 dark:border-purple-500/20 hover:border-purple-400/80 p-6 flex gap-4 items-start relative overflow-hidden">
              <div className="absolute bottom-2 right-4 text-3xl opacity-10 select-none font-bold">✨</div>
              <div className="p-3.5 rounded-2xl bg-pink-500/10 text-pink-300 border border-pink-500/20 flex-shrink-0">
                <Quote className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-pink-400 font-black uppercase tracking-wider">Lofi Quote of the Day</span>
                <p className="text-xs text-slate-300 italic leading-relaxed mt-1">"{quote.text}"</p>
                <span className="text-[10px] text-pink-300 font-semibold mt-1.5">- {quote.author}</span>
              </div>
            </div>

          </div>

          {/* Upcoming Group Events */}
          <div className="glass-card-kawaii border-sky-250/60 dark:border-sky-500/20 hover:border-sky-400/80 p-6 flex flex-col gap-4">
            
            {/* Birthday Alert Banner */}
            {bdaysToday.length > 0 && (
              <div className="rounded-2xl p-4 border border-pink-500/25 bg-pink-500/10 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-bounce">🎀</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-pink-300">Birthday Alert!</span>
                    <span className="text-xs text-slate-300 mt-0.5">
                      It is {bdaysToday.map((b) => b.username).join(', ')}'s birthday today! Send some wishes!
                    </span>
                  </div>
                </div>
                <Link
                  to="/chat"
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-transform hover:scale-[1.03] ${getAccentBtn()}`}
                >
                  Wish Them 🌸
                </Link>
              </div>
            )}

            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <CalIcon className="h-4.5 w-4.5 text-pink-400" /> Upcoming Group Events
              </span>
              <Link to="/calendar" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                View Calendar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.length === 0 ? (
                <div className="col-span-2 py-6 text-center text-xs text-slate-500">
                  No upcoming group trips or events scheduled. Create one on the calendar!
                </div>
              ) : (
                events.map((evt) => (
                  <div key={evt._id} className="rounded-2xl border border-pink-500/10 bg-slate-900/20 p-4 flex flex-col justify-between hover:border-pink-500/25 transition-all">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-bold text-slate-200 line-clamp-1">{evt.title}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full capitalize font-extrabold ${
                          evt.type === 'movie' ? 'bg-purple-950 text-purple-300' :
                          evt.type === 'match' ? 'bg-amber-950 text-amber-300' :
                          evt.type === 'trip' ? 'bg-pink-950 text-pink-300 border border-pink-900/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {evt.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {evt.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                      <span>
                        {new Date(evt.start).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span>
                        {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Access Navigation Row */}
          <div className="grid grid-cols-3 gap-4">
            <Link to="/chat" className="glass-card-kawaii border-pink-200/55 dark:border-pink-500/10 hover:border-pink-300/80 p-4 flex flex-col items-center gap-2 group text-center">
              <Users className="h-6 w-6 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Chat Room</span>
            </Link>
            <Link to="/study" className="glass-card-kawaii border-purple-200/55 dark:border-purple-500/10 hover:border-purple-300/80 p-4 flex flex-col items-center gap-2 group text-center">
              <Smile className="h-6 w-6 text-violet-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Study Notes</span>
            </Link>
            <Link to="/games" className="glass-card-kawaii border-yellow-200/55 dark:border-yellow-500/10 hover:border-yellow-300/80 p-4 flex flex-col items-center gap-2 group text-center">
              <PartyPopper className="h-6 w-6 text-yellow-300 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Games Room</span>
            </Link>
          </div>

        </div>

        {/* Right Side Column (Kawaii Presence, Lofi player and AI bot) */}
        <div className="flex flex-col gap-6">
          
          {/* Members Presence Board */}
          <div className="glass-card-kawaii border-pink-250/60 dark:border-pink-500/20 hover:border-pink-400/80 p-5 flex flex-col gap-4">
            <div className="pb-2 border-b border-slate-900 flex justify-between items-center">
              <span className="text-xs font-bold flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-pink-400" /> Circle Presence
              </span>
              <span className="text-[10px] text-pink-300 font-extrabold bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-900/30">
                {Object.keys(onlineUsers).length} Active
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
              {usersList.map((usr) => {
                const isOnline = onlineUsers[usr._id] !== undefined;
                return (
                  <div key={usr._id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 p-2.5 hover:border-pink-500/20 hover:bg-slate-900/30 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={usr.avatar || 'https://via.placeholder.com/150'}
                          alt={usr.username}
                          className="h-8.5 w-8.5 rounded-xl object-cover border border-slate-800"
                        />
                        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${
                          isOnline ? 'bg-pink-400 animate-pulse' : 'bg-slate-650'
                        }`} />
                      </div>
                      <div className="flex flex-col">
                        <Link to={`/profile/${usr._id}`} className="text-xs font-bold hover:underline hover:text-white">
                          {usr.username}
                        </Link>
                        <span className="text-[9px] text-slate-500 leading-normal">
                          {isOnline ? 'Online now 🌸' : `Active: ${new Date(usr.lastActive || usr.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950/40 px-2 py-0.5 rounded-full border border-slate-900">
                      <Flame className={`h-3 w-3 ${usr.loginStreak > 1 ? 'text-pink-400' : 'text-slate-600'}`} />
                      <span className="text-[10px] font-mono font-bold text-slate-300">{usr.loginStreak || 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Premium Entertainment Lofi & Emoji Player */}
          <div className="glass-card-kawaii border-orange-200/50 dark:border-orange-500/15 hover:border-orange-400/80 p-5 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute -top-3 -right-3 text-4xl opacity-10 select-none pointer-events-none">🍭</div>
            
            <span className="text-[10px] text-pink-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              🎵 Lofi Study Radio 🌸
            </span>

            {/* Simulated music player */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-900 p-3.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200 truncate max-w-28">{lofiTrack}</span>
                <span className="text-[9px] text-slate-500 mt-0.5">Lofi Circle Radio</span>
              </div>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-full h-8 w-8 bg-pink-400 hover:bg-pink-500 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current ml-0.5" />}
              </button>
            </div>

            {/* Sticker emoji click counters */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Emoji reactions</span>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                <button 
                  onClick={() => setSparklesCount(s => s + 1)}
                  className="rounded-xl border border-slate-900 bg-slate-900/20 p-2 hover:bg-pink-950/20 hover:border-pink-500/20 transition-all flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>✨</span>
                  <span className="text-[9px] font-mono text-slate-400">{sparklesCount}</span>
                </button>
                <button 
                  onClick={() => setHeartsCount(h => h + 1)}
                  className="rounded-xl border border-slate-900 bg-slate-900/20 p-2 hover:bg-pink-950/20 hover:border-pink-500/20 transition-all flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>💖</span>
                  <span className="text-[9px] font-mono text-slate-400">{heartsCount}</span>
                </button>
                <button 
                  onClick={() => setLaughsCount(l => l + 1)}
                  className="rounded-xl border border-slate-900 bg-slate-900/20 p-2 hover:bg-pink-950/20 hover:border-pink-500/20 transition-all flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>😂</span>
                  <span className="text-[9px] font-mono text-slate-400">{laughsCount}</span>
                </button>
                <button 
                  onClick={() => setPartiesCount(p => p + 1)}
                  className="rounded-xl border border-slate-900 bg-slate-900/20 p-2 hover:bg-pink-950/20 hover:border-pink-500/20 transition-all flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>🎉</span>
                  <span className="text-[9px] font-mono text-slate-400">{partiesCount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick AI Corner Card */}
          <div className="glass-card-kawaii border-purple-200/60 dark:border-purple-500/20 hover:border-purple-400/80 bg-gradient-to-br from-white/45 via-purple-50/10 to-pink-50/10 dark:from-slate-900/40 dark:via-purple-950/10 dark:to-pink-950/10 p-5 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 h-16 w-16 bg-pink-500/10 blur-xl group-hover:scale-150 transition-transform"></div>
            <span className="text-[10px] text-pink-400 font-black uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="h-4.5 w-4.5 animate-pulse" /> Advisor Assistant
            </span>
            <h3 className="text-base font-extrabold text-slate-200">Need Placement Help?</h3>
            <p className="text-xs text-slate-450 leading-relaxed font-light">
              FriendBot is ready. Upload your resume for critiques, polish spelling errors, or request mock coding questions.
            </p>
            <Link
              to="/ai"
              className={`text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-md mt-1 cursor-pointer ${getAccentBtn()}`}
            >
              Consult FriendBot 🤖✨
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
