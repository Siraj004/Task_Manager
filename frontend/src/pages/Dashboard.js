import React, { useState, useEffect } from 'react';
import {
  User, Settings, Eye, Code, TestTube, Shield, ArrowRight,
  Edit3, MessageSquare, CheckCircle, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const StatsCard = ({ icon, title, value, subtitle, color = "from-blue-500/20 to-purple-500/20" }) => (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${color} border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-300 mb-1">{title}</div>
      <div className="text-xs text-slate-400">{subtitle}</div>
    </div>
  );

const rolePermissions = {
  'Admin': ['manage_users', 'assign_roles', 'create_delete_projects', 'create_edit_delete_tasks', 'assign_users', 'view_update_tasks', 'add_comments', 'mark_tested'],
  'Project Manager': ['create_edit_delete_tasks', 'assign_users', 'view_update_tasks', 'add_comments'],
  'Developer': ['view_update_tasks', 'add_comments'],
  'Tester': ['view_update_tasks', 'mark_tested', 'add_comments'],
  'Viewer': ['read_only']
};

const getRoleIcon = (role) => {
  switch (role) {
    case 'Admin': return <Shield className="w-4 h-4" />;
    case 'Project Manager': return <Settings className="w-4 h-4" />;
    case 'Developer': return <Code className="w-4 h-4" />;
    case 'Tester': return <TestTube className="w-4 h-4" />;
    case 'Viewer': return <Eye className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin': return 'from-red-500/20 to-pink-500/20 border-red-500/30';
    case 'Project Manager': return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
    case 'Developer': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    case 'Tester': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    case 'Viewer': return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    default: return 'from-purple-500/20 to-violet-500/20 border-purple-500/30';
  }
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  // Join project room 1 for notifications
  useEffect(() => {
    if (socket && user) {
      socket.emit('joinProject', 1);
      return () => socket.emit('leaveProject', 1);
    }
  }, [socket, user]);

  useEffect(() => {
    // Socket notification handling
    if (socket) {
      socket.on('newTask', (data) => {
        toast.success(`New task created: ${data.task?.title}`, {
          duration: 5000,
          position: 'top-right',
        });
      });

      socket.on('taskUpdated', (data) => {
        toast.info(`Task updated: ${data.title}`, {
          duration: 5000,
          position: 'top-right',
        });
      });

      socket.on('taskDeleted', (data) => {
        toast.error(`Task deleted: ${data.title}`, {
          duration: 5000,
          position: 'top-right',
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('newTask');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
      }
    };
  }, [socket]);

  useEffect(() => {
    // Wait for user data to be available
    if (user && user.roles && user.roles.length > 0) {
      setIsLoading(false);
    } else if (user === null) {
      // If user is explicitly null, redirect to login
      navigate('/login');
    }
  }, [user, navigate]);

  // Additional safety check - if we're still loading after 3 seconds, stop loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Fetch persistent notifications on dashboard load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/admin/notifications');
        if (Array.isArray(res.data)) {
          res.data.forEach(n => {
            toast(n.message, {
              icon: n.type === 'task_created' ? '📝' : '🔔',
              duration: 5000,
              position: 'top-right',
            });
          });
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const sampleProject = {
    id: 1,
    name: "TeamTasker Core",
    description: "Core features development with role-based access control",
    progress: 65,
    tasks: [
      {
        id: 1,
        title: "Design Database Schema",
        description: "Plan and create the database schema for task tracking",
        status: "In Progress",
        assignee: "Developer"
      },
      {
        id: 2,
        title: "Implement Authentication",
        description: "JWT-based authentication with role management",
        status: "Completed",
        assignee: "Developer"
      },
      {
        id: 3,
        title: "Create User Interface",
        description: "Modern UI with Tailwind CSS",
        status: "In Progress",
        assignee: "Developer"
      },
      {
        id: 4,
        title: "Write Unit Tests",
        description: "Comprehensive testing for all components",
        status: "Pending",
        assignee: "Tester"
      }
    ]
  };

  const hasPermission = (permission) => {
    const userRole = user?.roles?.[0];
    return rolePermissions[userRole]?.includes(permission);
  };

  // Loading screen - show while auth is being determined
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="text-white text-lg font-medium">Loading your workspace...</div>
          <div className="text-slate-400 text-sm mt-2">Preparing your dashboard</div>
        </div>
      </div>
    );
  }

  // If user exists but no roles, show error
  if (!user.roles || user.roles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="text-white text-lg font-medium">Role Assignment Required</div>
          <div className="text-slate-400 text-sm mt-2">Please contact your administrator to assign a role</div>
          <button 
            onClick={logout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const Navigation = () => (
    <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">LarkLabs</span>
              <div className="text-xs text-slate-400 -mt-1">Project Management</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r ${getRoleColor(user.roles[0])} border backdrop-blur-sm`}>
              <div className="flex items-center space-x-2">
                {getRoleIcon(user.roles[0])}
                <span className="text-white text-sm font-medium">{user.username}</span>
              </div>
              <div className="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded-full">
                {user.roles[0]}
              </div>
            </div>
            <button 
              onClick={logout} 
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const PermissionCard = ({ label, icon, has, description }) => (
    <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
      has 
        ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50' 
        : 'bg-gradient-to-br from-slate-500/5 to-slate-600/5 border-slate-600/20 opacity-60'
    }`}>
      <div className="flex items-center space-x-3 mb-2">
        <div className={`p-2 rounded-lg ${has ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className={`text-sm font-medium ${has ? 'text-white' : 'text-slate-400'}`}>
            {label}
          </div>
          <div className="text-xs text-slate-500">{description}</div>
        </div>
      </div>
      {has && (
        <div className="flex items-center space-x-1 text-xs text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span>Enabled</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      <Navigation />

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">LarkLabs</span>
            </h1>
          </div>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Your intelligent project management companion. Streamline workflows, enhance collaboration, 
            and deliver exceptional results with our AI-powered platform.
          </p>
        </div>

        {/* Permissions Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Your Access Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <PermissionCard 
              label="User Management" 
              icon={<Shield className="w-4 h-4 text-white" />} 
              has={hasPermission('manage_users')}
              description="Create and manage users"
            />
            <PermissionCard 
              label="Task Management" 
              icon={<Edit3 className="w-4 h-4 text-white" />} 
              has={hasPermission('create_edit_delete_tasks')}
              description="Create and edit tasks"
            />
            <PermissionCard 
              label="Quality Testing" 
              icon={<CheckCircle className="w-4 h-4 text-white" />} 
              has={hasPermission('mark_tested')}
              description="Mark tasks as tested"
            />
            <PermissionCard 
              label="Communication" 
              icon={<MessageSquare className="w-4 h-4 text-white" />} 
              has={hasPermission('add_comments') || hasPermission('read_only')}
              description="View and comment"
            />
          </div>
        </div>

        {/* Project Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Current Project</h2>
          <div 
            className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]" 
            onClick={() => navigate(`/projects/${sampleProject.id}`)}
          >
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-2xl font-bold text-white">{sampleProject.name}</h3>
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 font-medium">
                      Active
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-4">{sampleProject.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>{sampleProject.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${sampleProject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:translate-x-2 transition-all duration-300 ml-6" />
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  Click to explore project details and manage tasks
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-slate-500 text-sm">
            Powered by LarkLabs AI • Built for modern teams
          </p>
        </div>
      </div>
    </div>
  );
}