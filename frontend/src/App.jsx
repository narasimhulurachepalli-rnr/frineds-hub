import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ToastList from './components/ToastList';
import Loader from './components/Loader';

// Views
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import InviteVerify from './views/InviteVerify';
import GroupChat from './views/GroupChat';
import StudyHub from './views/StudyHub';
import FileShare from './views/FileShare';
import Memories from './views/Memories';
import SharedNotes from './views/SharedNotes';
import CalendarView from './views/CalendarView';
import Entertainment from './views/Entertainment';
import GamesRoom from './views/GamesRoom';
import LeaderboardView from './views/LeaderboardView';
import AICorner from './views/AICorner';
import SettingsView from './views/SettingsView';
import AdminPanel from './views/AdminPanel';
import AboutPage from './views/AboutPage';
import FAQPage from './views/FAQPage';
import ContactAdmin from './views/ContactAdmin';

// Route Guards
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Main Layout Wrapper
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, themeColor } = useTheme();

  const getBgClass = () => {
    if (theme === 'light') return 'animated-bg-light text-slate-900';
    if (themeColor === 'girls') return 'animated-bg-girls text-slate-100';
    return 'animated-bg text-slate-100';
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 relative overflow-hidden ${getBgClass()}`}>
      
      {/* Girls Aesthetic Floating Particles Overlay */}
      {themeColor === 'girls' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          
          {/* Aurora Blur Blobs */}
          <div className="absolute top-1/4 left-[-10%] h-96 w-96 rounded-full bg-pink-300/15 dark:bg-pink-900/10 blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-[-10%] h-96 w-96 rounded-full bg-purple-300/15 dark:bg-purple-900/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/3 right-[15%] h-80 w-80 rounded-full bg-sky-200/10 dark:bg-indigo-900/10 blur-[90px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

          {/* Light Rays Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,214,232,0.12),rgba(207,239,255,0.06),transparent_60%)] light-rays-bg pointer-events-none"></div>

          {/* Floating Butterflies */}
          <div className="absolute top-24 left-[35%] text-2xl butterfly-float select-none opacity-40">🦋</div>
          <div className="absolute bottom-40 right-[35%] text-xl butterfly-float select-none opacity-30" style={{ animationDelay: '2.5s' }}>🦋</div>

          {/* Falling Sakura Petals */}
          <div className="sakura-petal h-3.5 w-3.5" style={{ left: '8%', animationDelay: '0s', animationDuration: '13s' }}></div>
          <div className="sakura-petal h-4 w-4" style={{ left: '22%', animationDelay: '2.5s', animationDuration: '16s' }}></div>
          <div className="sakura-petal h-3 w-3" style={{ left: '42%', animationDelay: '4.2s', animationDuration: '14s' }}></div>
          <div className="sakura-petal h-4.5 w-4.5" style={{ left: '60%', animationDelay: '1.2s', animationDuration: '17s' }}></div>
          <div className="sakura-petal h-3 w-3" style={{ left: '78%', animationDelay: '6s', animationDuration: '15s' }}></div>
          <div className="sakura-petal h-3.5 w-3.5" style={{ left: '91%', animationDelay: '3.1s', animationDuration: '18s' }}></div>
          
          {/* Drifting Clouds */}
          <div className="cloud-drift-slow top-12 text-6xl select-none">☁️</div>
          <div className="cloud-drift-slow top-36 text-5xl select-none" style={{ animationDuration: '110s', animationDelay: '-15s' }}>☁️</div>
          
          {/* Twinkling Stars */}
          <div className="absolute top-14 left-[15%] text-xs star-twinkle text-yellow-200 select-none">✨</div>
          <div className="absolute top-48 right-[10%] text-sm star-twinkle text-pink-200 select-none" style={{ animationDelay: '1.6s' }}>✨</div>
          <div className="absolute bottom-32 left-[28%] text-xs star-twinkle text-purple-200 select-none" style={{ animationDelay: '0.9s' }}>✨</div>
          
          {/* Rising Hearts */}
          <div className="absolute bottom-20 left-[18%] text-sm heart-float text-rose-300 select-none">💖</div>
          <div className="absolute bottom-40 right-[22%] text-xs heart-float text-pink-300 select-none" style={{ animationDelay: '1.4s' }}>💝</div>

          {/* Corner Illustrations stickers */}
          <div className="absolute bottom-8 left-8 text-5xl cozy-float select-none opacity-80 hidden lg:block" title="Cozy Bunny 🐰">🐰🌸</div>
          <div className="absolute bottom-8 right-8 text-5xl cozy-float select-none opacity-80 hidden lg:block" style={{ animationDelay: '2.5s' }} title="Cozy Teddy 🧸">🧸✨</div>
          <div className="absolute top-20 left-6 text-3xl cozy-float select-none opacity-60 hidden lg:block" style={{ animationDelay: '1.2s' }} title="Cherry Blossom 🌸">🌸✨</div>
          <div className="absolute top-20 right-6 text-3xl cozy-float select-none opacity-60 hidden lg:block" style={{ animationDelay: '3.8s' }} title="Tulip 🌷">🌷🌸</div>
          
        </div>
      )}

      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-grow overflow-hidden z-10 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <div className="flex-grow">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export const AppContent = () => {
  const { theme } = useTheme();
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invite/:code" element={<InviteVerify />} />

          {/* Protected Platform Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/chat" element={<GroupChat />} />
              <Route path="/study" element={<StudyHub />} />
              <Route path="/files" element={<FileShare />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/notes" element={<SharedNotes />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/entertainment" element={<Entertainment />} />
              <Route path="/games" element={<GamesRoom />} />
              <Route path="/leaderboard" element={<LeaderboardView />} />
              <Route path="/ai" element={<AICorner />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact-admin" element={<ContactAdmin />} />
              
              {/* Admin Panel Gate */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Route>
          </Route>

          {/* Redirect generic fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastList />
      </BrowserRouter>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
