import User from '../models/user.js';

// Map to track active user socket counts
const activeConnections = {}; // userId -> array of socketIds

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room / Register User
    socket.on('join', async (userId) => {
      if (!userId) return;
      socket.userId = userId;

      // Track socket connection
      if (!activeConnections[userId]) {
        activeConnections[userId] = [];
      }
      if (!activeConnections[userId].includes(socket.id)) {
        activeConnections[userId].push(socket.id);
      }

      // Update user online status
      try {
        const user = await User.findById(userId);
        if (user && user.status !== 'Online') {
          user.status = 'Online';
          user.lastActive = new Date();
          await user.save();

          // Broadcast status change
          io.emit('user_status_change', {
            userId: user._id,
            username: user.username,
            status: 'Online',
            lastActive: user.lastActive,
          });
        }
      } catch (error) {
        console.error('Socket Join error:', error.message);
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      // data: { userId, username, isTyping }
      socket.broadcast.emit('typing_status', data);
    });

    // Handle disconnecting
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const userId = socket.userId;

      if (userId && activeConnections[userId]) {
        // Remove current socket ID
        activeConnections[userId] = activeConnections[userId].filter((id) => id !== socket.id);

        // If no more active sockets for this user, mark as Offline
        if (activeConnections[userId].length === 0) {
          delete activeConnections[userId];

          try {
            const user = await User.findById(userId);
            if (user) {
              user.status = 'Offline';
              user.lastActive = new Date();
              await user.save();

              // Broadcast status change
              io.emit('user_status_change', {
                userId: user._id,
                username: user.username,
                status: 'Offline',
                lastActive: user.lastActive,
              });
            }
          } catch (error) {
            console.error('Socket disconnect DB error:', error.message);
          }
        }
      }
    });
  });
};

export default socketHandler;
