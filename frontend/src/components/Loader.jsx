import React from 'react';

export const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="relative flex flex-col items-center">
          {/* Animated glow ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur opacity-75 animate-pulse"></div>
          
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 border border-slate-800">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"></div>
          </div>
          
          <span className="mt-4 text-sm font-semibold tracking-wider text-slate-300 uppercase animate-pulse">
            FriendHub Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500 dark:border-slate-800 dark:border-t-indigo-500"></div>
    </div>
  );
};

export default Loader;
