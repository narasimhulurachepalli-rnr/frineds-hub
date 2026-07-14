import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { Trophy, Award, MessageCircle, FileText, Gamepad2, Sparkles } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const LeaderboardView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/games/leaderboard');
      setData(res.data);
    } catch (e) {
      console.error('Fetch leaderboard error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) return <Loader />;

  // Chart configuration
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 10 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 10 },
        },
      },
    },
  };

  const chartData = {
    labels: data.map((item) => item.username),
    datasets: [
      {
        label: 'Total Points',
        data: data.map((item) => item.totalPoints),
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Competitive Rankings
        </span>
        <h1 className="text-2xl font-extrabold text-white mt-1">Circle Leaderboard</h1>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-16 text-xs text-slate-500 border border-slate-900 bg-slate-950/45 rounded-2xl">
          Scoreboard is currently empty.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* Chart Display segment */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 block">Points Comparison Chart</span>
            <div className="h-60 md:h-72 w-full flex items-center justify-center">
              <Bar options={chartOptions} data={chartData} />
            </div>
          </div>

          {/* Table display segment */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 overflow-hidden shadow-lg">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                
                {/* Table Header */}
                <thead className="bg-slate-950/80 border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="px-5 py-4 w-12 text-center">Rank</th>
                    <th className="px-5 py-4">Friend</th>
                    <th className="px-5 py-4 text-center">Streak</th>
                    <th className="px-5 py-4 text-center">Chats</th>
                    <th className="px-5 py-4 text-center">Shared Notes</th>
                    <th className="px-5 py-4 text-center">Game Wins</th>
                    <th className="px-5 py-4 text-center">Total Points</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-900/60">
                  {data.map((row, index) => {
                    const isTopThree = index < 3;
                    return (
                      <tr key={row._id} className="hover:bg-slate-900/20 transition-colors">
                        
                        {/* Rank */}
                        <td className="px-5 py-4 text-center">
                          {index === 0 ? (
                            <span className="text-xl" title="Friend of the Month! 👑">👑</span>
                          ) : (
                            <span className={`font-mono font-black ${
                              index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                            }`}>
                              {index + 1}
                            </span>
                          )}
                        </td>

                        {/* Friend Profile */}
                        <td className="px-5 py-4 font-bold text-slate-200">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={row.avatar || 'https://via.placeholder.com/150'}
                              alt="Avatar"
                              className="h-8 w-8 rounded-lg object-cover border border-slate-800"
                            />
                            <span className="truncate">{row.username}</span>
                          </div>
                        </td>

                        {/* Login Streak */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-semibold text-slate-300">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                            <span>{row.loginStreak || 1}</span>
                          </div>
                        </td>

                        {/* Chats Count */}
                        <td className="px-5 py-4 text-center text-slate-400 font-semibold">
                          <div className="flex items-center justify-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5 text-rose-500 opacity-60" />
                            <span>{row.chatCount || 0}</span>
                          </div>
                        </td>

                        {/* Uploads Count */}
                        <td className="px-5 py-4 text-center text-slate-400 font-semibold">
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-emerald-500 opacity-60" />
                            <span>{row.uploadsTotal || 0}</span>
                          </div>
                        </td>

                        {/* Game wins */}
                        <td className="px-5 py-4 text-center text-slate-400 font-semibold">
                          <div className="flex items-center justify-center gap-1">
                            <Gamepad2 className="h-3.5 w-3.5 text-purple-500 opacity-60" />
                            <span>{row.gamesWon || 0}</span>
                          </div>
                        </td>

                        {/* Total Points */}
                        <td className="px-5 py-4 text-center font-black text-indigo-400 font-mono">
                          {row.totalPoints} PTS
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default LeaderboardView;
