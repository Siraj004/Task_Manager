import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit3, Trash2, CheckCircle, Clock, 
  User, MessageSquare, Shield, Settings, Code, TestTube, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

const sampleProjectData = {
  1: {
    id: 1,
    name: "TeamTasker Core",
    description: "Core features development with role-based access control",
    tasks: [
      { id: 1, title: "Design Database Schema", description: "Plan and create the database schema", status: "In Progress", assignee: "Developer", priority: "High" },
      { id: 2, title: "Implement Authentication", description: "JWT-based authentication with role management", status: "Completed", assignee: "Developer", priority: "High" },
      { id: 3, title: "Create User Interface", description: "Modern UI with Tailwind CSS", status: "In Progress", assignee: "Developer", priority: "Medium" },
      { id: 4, title: "Write Unit Tests", description: "Comprehensive testing for all components", status: "Pending", assignee: "Tester", priority: "Medium" },
      { id: 5, title: "Performance Testing", description: "Load testing and optimization", status: "Pending", assignee: "Tester", priority: "Low" }
    ]
  }
};

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);
  
  const project = sampleProjectData[id];
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasPermission = (permission) => {
    const userRole = user?.roles[0];
    return rolePermissions[userRole]?.includes(permission);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400';
      case 'Medium': return 'bg-orange-500/20 text-orange-400';
      case 'Low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const TaskCard = ({ task }) => (
    <div 
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer"
      onClick={() => hasPermission('view_update_tasks') || hasPermission('read_only') ? setSelectedTask(task) : null}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white font-semibold text-sm">{task.title}</h3>
        <div className="flex items-center space-x-2">
          {hasPermission('create_edit_delete_tasks') && (
            <button className="p-1 hover:bg-white/10 rounded">
              <Edit3 className="w-3 h-3 text-gray-400" />
            </button>
          )}
          {hasPermission('create_edit_delete_tasks') && (
            <button className="p-1 hover:bg-white/10 rounded">
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-gray-300 text-xs mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <User className="w-3 h-3 mr-1" />
          {task.assignee}
        </div>
      </div>
    </div>
  );

  const TaskModal = () => {
    if (!selectedTask) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedTask.title}</h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Description</h3>
              <p className="text-gray-300">{selectedTask.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Assignee</h3>
              <div className="flex items-center space-x-2">
                {getRoleIcon(selectedTask.assignee)}
                <span className="text-gray-300">{selectedTask.assignee}</span>
              </div>
            </div>

            {hasPermission('add_comments') && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Comments</h3>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Developer • 2 hours ago</span>
                    </div>
                    <p className="text-gray-300 text-sm">Making good progress on the database schema design.</p>
                  </div>
                </div>
                <div className="mt-3">
                  <textarea 
                    placeholder="Add a comment..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 text-sm"
                    rows="3"
                  />
                  <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    Add Comment
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              {hasPermission('view_update_tasks') && (
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                  Update Task
                </button>
              )}
              {hasPermission('mark_tested') && selectedTask.status !== 'Completed' && (
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                  Mark as Tested
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-white">{project.name}</h1>
                  <p className="text-sm text-gray-300">{project.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {hasPermission('create_edit_delete_tasks') && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                )}
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10">
                  {getRoleIcon(user.roles[0])}
                  <span className="text-white text-sm">{user.username}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Tasks</h2>
              <div className="text-sm text-gray-300">
                {project.tasks.length} total tasks
              </div>
            </div>
            
            {!hasPermission('read_only') ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Viewer Access</h3>
                <p className="text-gray-300">You have read-only access to this project. Contact an admin for additional permissions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <TaskModal />
    </div>
  );
}