import React, { useState } from 'react';
import {
  User, Settings, Eye, Code, TestTube, Shield, ArrowRight,
  Edit3, MessageSquare, CheckCircle, LogOut
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const rolePermissions = {
  'Admin': ['manage_users', 'assign_roles', 'create_delete_projects', 'create_edit_delete_tasks', 'assign_users', 'view_update_tasks', 'add_comments', 'mark_tested'],
  'Project Manager': ['create_edit_delete_tasks', 'assign_users', 'view_update_tasks', 'add_comments'],
  'Developer': ['view_update_tasks', 'add_comments'],
  'Tester': ['view_update_tasks', 'mark_tested', 'add_comments'],
  'Viewer': ['read_only']
};

const getRoleIcon = (role) => {
  switch (role) {
    case 'Admin': return <Shield className="w-5 h-5" />;
    case 'Project Manager': return <Settings className="w-5 h-5" />;
    case 'Developer': return <Code className="w-5 h-5" />;
    case 'Tester': return <TestTube className="w-5 h-5" />;
    case 'Viewer': return <Eye className="w-5 h-5" />;
    default: return <User className="w-5 h-5" />;
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin': return 'from-red-500 to-pink-500';
    case 'Project Manager': return 'from-blue-500 to-indigo-500';
    case 'Developer': return 'from-green-500 to-emerald-500';
    case 'Tester': return 'from-yellow-500 to-orange-500';
    case 'Viewer': return 'from-gray-500 to-slate-500';
    default: return 'from-purple-500 to-violet-500';
  }
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState(null);
const navigate = useNavigate();
  const sampleProject = {
    id: 1,
    name: "TeamTasker Core",
    description: "Core features development with role-based access control",
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
      },
      {
        id: 5,
        title: "Performance Testing",
        description: "Load testing and optimization",
        status: "Pending",
        assignee: "Tester"
      }
    ]
  };

  const hasPermission = (permission) => {
    const userRole = user?.roles[0];
    return rolePermissions[userRole]?.includes(permission);
  };

  const canAccessTaskDetails = () => {
    return !user?.roles.includes('Viewer');
  };

  const Navigation = () => (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-white">ProjectHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getRoleColor(user.roles[0])}`}>
              {getRoleIcon(user.roles[0])}
              <span className="text-white text-sm font-medium">{user.username}</span>
              <span className="text-white/80 text-xs">({user.roles[0]})</span>
            </div>
            <button onClick={logout} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const DashboardView = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <Navigation />
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Welcome to ProjectHub
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Advanced task management with role-based access control
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Your Permissions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PermissionBox label="Manage Users" icon={<Shield className="w-6 h-6 text-white mb-2" />} has={hasPermission('manage_users')} />
            <PermissionBox label="Edit Tasks" icon={<Edit3 className="w-6 h-6 text-white mb-2" />} has={hasPermission('create_edit_delete_tasks')} />
            <PermissionBox label="Mark Tested" icon={<CheckCircle className="w-6 h-6 text-white mb-2" />} has={hasPermission('mark_tested')} />
            <PermissionBox label="View/Comment" icon={<MessageSquare className="w-6 h-6 text-white mb-2" />} has={hasPermission('add_comments') || hasPermission('read_only')} />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Sample Project</h2>
         <div className="group cursor-pointer" onClick={() => navigate(`/projects/${sampleProject.id}`)}>

            <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{sampleProject.name}</h3>
                  <p className="text-gray-300 leading-relaxed">{sampleProject.description}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform duration-300" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">{sampleProject.tasks.length} tasks</span>
                  <span className="text-sm text-gray-300">•</span>
                  <span className="text-sm text-gray-300">Role-based access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const PermissionBox = ({ label, icon, has }) => (
    <div className={`p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 ${has ? 'ring-2 ring-green-400/50' : 'opacity-50'}`}>
      {icon}
      <p className="text-sm text-white font-medium">{label}</p>
    </div>
  );

  return (
    <div>
      {currentView === 'dashboard' && <DashboardView />}
    </div>
  );
}
