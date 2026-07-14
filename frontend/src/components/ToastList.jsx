import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import { X, CheckCircle, AlertTriangle, Info, BellRing } from 'lucide-react';

export const ToastList = () => {
  const { toasts, dismissToast } = useNotification();

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200',
          icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/30 text-amber-200',
          icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-950/90 border-rose-500/30 text-rose-200',
          icon: <X className="h-5 w-5 text-rose-400" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/90 border-indigo-500/30 text-slate-200',
          icon: <Info className="h-5 w-5 text-indigo-400" />,
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md ${styles.bg}`}
            >
              <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
              <div className="flex-grow flex flex-col">
                <span className="text-sm font-bold tracking-wide">{toast.title}</span>
                <span className="text-xs text-slate-300 mt-0.5 font-light leading-relaxed">{toast.message}</span>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 rounded-lg p-0.5 hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 opacity-60 hover:opacity-100" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastList;
