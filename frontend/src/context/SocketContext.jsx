import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({}); // { userId: username }
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to server (Vite proxies this, or absolute address)
    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // Join room with userId
    newSocket.emit('join', user._id);

    // Request full status updates (we can load online statuses from users list)
    newSocket.on('user_status_change', (data) => {
      // data: { userId, username, status }
      setOnlineUsers((prev) => {
        const updated = { ...prev };
        if (data.status === 'Online') {
          updated[data.userId] = data.username;
        } else {
          delete updated[data.userId];
        }
        return updated;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, setOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
