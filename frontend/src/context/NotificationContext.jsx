import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]); // List of active floating toast messages
  const { user } = useAuth();
  const { socket } = useSocket();

  const showToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      
      // Calculate unread: recipient === null or recipient === userId, and not readBy.includes(userId)
      const unread = res.data.filter((n) => !n.readBy.includes(user._id)).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Fetch notifications error:', error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Subscribe to real-time socket notifications
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notif) => {
      // Don't toast if the sender is the current user themselves
      if (notif.sender?._id === user._id) {
        // Fetch to update the list, but don't show toast
        fetchNotifications();
        return;
      }

      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger visual toast
      showToast(notif.title, notif.message, notif.type === 'announcement' ? 'warning' : 'success');
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, user]);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-read', { notificationIds: [] });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readBy: [...new Set([...n.readBy, user._id])],
        }))
      );
    } catch (error) {
      console.error('Mark all notifications error:', error.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // Re-fetch to synchronize unread counts
      fetchNotifications();
    } catch (error) {
      console.error('Delete notification error:', error.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        dismissToast,
        fetchNotifications,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
