import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ minimal = false }) => {
  const { theme, toggleTheme, themeColor, setThemeColor } = useTheme();

  const colors = [
    { name: 'indigo', hex: 'bg-indigo-500 border-indigo-600' },
    { name: 'violet', hex: 'bg-violet-500 border-violet-600' },
    { name: 'emerald', hex: 'bg-emerald-500 border-emerald-600' },
    { name: 'rose', hex: 'bg-rose-500 border-rose-600' },
    { name: 'amber', hex: 'bg-amber-500 border-amber-600' },
    { name: 'girls', hex: 'bg-pink-300 border-pink-400' },
  ];

  if (minimal) {
    return (
      <button
        onClick={toggleTheme}
        className="rounded-xl p-2 bg-slate-900 border border-slate-800 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-800 transition-colors"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-500" />}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl glass-card text-slate-200">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold">Theme Mode</span>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 transition-all text-xs font-medium"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" /> Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-400" /> Dark Mode
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Accent Color</span>
        <div className="flex gap-2.5 mt-1">
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setThemeColor(c.name)}
              className={`h-7 w-7 rounded-full border-2 ${c.hex} transition-transform ${
                themeColor === c.name ? 'scale-125 shadow-lg border-white' : 'opacity-70 hover:opacity-100 hover:scale-110'
              }`}
              title={`Accent: ${c.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
