// src/components/NotificationPopup.js
import React from 'react';
import { X, CheckCircle, MessageSquare, User, Zap, Bell } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const NotificationPopup = () => {
  const { notifications, removeNotification, clearAllNotifications } = useSocket();

  if (notifications.length === 0) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_created':
        return <Zap className="w-5 h-5 text-green-400" />;
      case 'task_updated':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'task_assigned':
        return <User className="w-5 h-5 text-purple-400" />;
      case 'comment_added':
        return <MessageSquare className="w-5 h-5 text-orange-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_created':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'task_updated':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'task_assigned':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'comment_added':
        return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {/* Clear all button */}
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={clearAllNotifications}
            className="px-3 py-1 bg-gray-600/80 hover:bg-gray-600 text-white text-xs rounded-full backdrop-blur-sm border border-gray-500/30 transition-all duration-200"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-gradient-to-br ${getNotificationColor(notification.type)} border backdrop-blur-sm rounded-xl p-4 shadow-lg transform transition-all duration-300 animate-slide-in-right hover:scale-[1.02]`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 p-1 bg-white/10 rounded-lg">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-slate-300 text-xs mb-2 leading-relaxed">
                  {notification.message}
                </p>
                
                {/* Additional info based on type */}
                {notification.type === 'task_created' && notification.createdBy && (
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <User className="w-3 h-3" />
                    <span>by {notification.createdBy}</span>
                    {notification.projectName && (
                      <>
                        <span>•</span>
                        <span>{notification.projectName}</span>
                      </>
                    )}
                  </div>
                )}
                
                {notification.type === 'task_assigned' && notification.projectName && (
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>Project: {notification.projectName}</span>
                  </div>
                )}

                <div className="text-xs text-slate-500 mt-2">
                  {formatTimeAgo(notification.timestamp)}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors duration-200 ml-2"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>

          {/* Progress bar for auto-dismiss */}
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/30 rounded-full animate-progress-bar"
              style={{ animation: 'progressBar 5s linear forwards' }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-progress-bar {
          animation: progressBar 5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationPopup;