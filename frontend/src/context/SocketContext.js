// 1. Updated SocketContext.js with better debugging
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, token } = useAuth();

  const addNotification = useCallback((notification) => {
    console.log('🔔 Adding notification:', notification);
    const notificationWithId = {
      ...notification,
      id: Date.now() + Math.random()
    };
    setNotifications(prev => [notificationWithId, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationWithId.id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (user && token) {
      console.log('🚀 Initializing socket for user:', user.username);
      
      // Use the deployed backend URL for Render, or fallback to localhost for local dev
      const socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token: token },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('🔗 Socket connected:', socketInstance.id, 'User:', user.username);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ Socket disconnected for user:', user.username);
        setIsConnected(false);
      });

      // Enhanced task created listener with more logging
      socketInstance.on('taskCreated', (data) => {
        console.log('📋 RECEIVED taskCreated event:', data);
        console.log('📋 Current user ID:', user.id, 'Creator ID:', data.createdById);
        
        if (String(data.createdById) !== String(user.id)) {
          console.log('✅ Showing notification to user:', user.username);
          addNotification({
            type: 'task_created',
            title: 'New Task Created',
            message: `"${data.task?.title || 'Unknown Task'}" has been created in ${data.projectName || 'Unknown Project'}`,
            timestamp: new Date(),
            createdBy: data.createdBy,
            projectName: data.projectName,
            data
          });
        } else {
          console.log('⏭️ Skipping notification for task creator');
        }
      });

      socketInstance.on('taskUpdated', (data) => {
        console.log('📝 Task updated:', data);
        if (data.updatedById !== user.id) {
          addNotification({
            type: 'task_updated',
            title: 'Task Updated',
            message: `"${data.title}" status changed to ${data.status}`,
            timestamp: new Date(),
            data
          });
        }
      });

      socketInstance.on('commentAdded', (data) => {
        console.log('💬 New comment added:', data);
        if (data.userId !== user.id) {
          addNotification({
            type: 'comment_added',
            title: 'New Comment',
            message: `${data.username} commented on "${data.taskTitle}"`,
            timestamp: new Date(),
            data
          });
        }
      });

      setSocket(socketInstance);

      return () => {
        console.log('🧹 Cleaning up socket for user:', user.username);
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user, token, addNotification]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// 2. Updated ProjectBoard.js useEffect (key section)
// In your ProjectBoard.js, make sure this useEffect properly joins the project room:



// 3. When creating a task, make sure to emit the socket event
// In your task creation function, add this:
