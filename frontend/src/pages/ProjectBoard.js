// src/pages/ProjectBoard.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit3, Trash2, CheckCircle, Clock,
  User, MessageSquare, Shield, Settings, Code, TestTube, Eye,
  Save, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
// Assuming TaskService is a separate module to handle API calls for tasks
// For demonstration, we define TaskService here (could be in src/services/TaskService.js)

/**
 * TaskService: handles task-related API calls
 */
class TaskService {
  static async getAllTasks() {
    const res = await api.get('/tasks');
    return res.data;
  }

  static async getTaskById(taskId) {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data;
  }

  static async createTask(taskData) {
    const res = await api.post('/tasks', taskData);
    return res.data;
  }

  static async updateTask(taskId, taskData) {
    const res = await api.put(`/tasks/${taskId}`, taskData);
    return res.data;
  }

  static async deleteTask(taskId) {
    await api.delete(`/tasks/${taskId}`);
    return null;
  }

  static async markAsTested(taskId) {
    const res = await api.post(`/tasks/${taskId}/tested`);
    return res.data;
  }

  static async addComment(taskId, text) {
    const res = await api.post(`/tasks/${taskId}/comments`, { text });
    return res.data;
  }
}

// Permissions mapping for UI (as a reference)
const rolePermissions = {
  Admin:              ['manage_users','assign_roles','create_delete_projects','create_edit_delete_tasks','assign_users','view_update_tasks','add_comments','mark_tested'],
  'Project Manager':  ['create_edit_delete_tasks','assign_users','view_update_tasks','add_comments'],
  Developer:          ['view_update_tasks','add_comments'],
  Tester:             ['view_update_tasks','mark_tested','add_comments'],
  Viewer:             ['read_only']
};

// Icon for each role (optional UI flair)
const getRoleIcon = (role) => {
  switch (role) {
    case 'Admin':           return <Shield className="w-4 h-4" />;
    case 'Project Manager': return <Settings className="w-4 h-4" />;
    case 'Developer':       return <Code className="w-4 h-4" />;
    case 'Tester':          return <TestTube className="w-4 h-4" />;
    case 'Viewer':          return <Eye className="w-4 h-4" />;
    default:                return null;
  }
};

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Local state
  const [projectName, setProjectName] = useState('');
  const [projectRole, setProjectRole] = useState('');
  const [users, setUsers] = useState([]);               // List of users for assignee dropdown
  const [tasks, setTasks] = useState([]);               // List of tasks for this project
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title:'', description:'', status:'Pending', assigneeId:'' });
  const [editingTask, setEditingTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [loading, setLoading] = useState(true);         // Overall loading state (project + tasks)
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);      // Indicates create/edit in progress

  // Check if current user's role has a permission
  const hasPermission = (permission) => {
    if (!user?.roles?.length) return false;
    const role = user.roles[0];
    return role && rolePermissions[role]?.includes(permission);
  };

  // Fetch project details (name, user role in project) and users (for assignee)
  const fetchProjectData = useCallback(async () => {
    if (!id) return;
    try {
      // Fetch project by ID
      const res = await api.get(`/projects/${id}`);
      const projectData = res.data;
      setProjectName(projectData.name || '');
      setProjectRole(projectData.role || '');

      // If user can assign users or manage users, fetch all users for assignee list
      if (hasPermission('assign_users') || hasPermission('manage_users')) {
        try {
          const usersRes = await api.get('/admin/users');
          setUsers(usersRes.data);
        } catch (err) {
          console.warn("Could not fetch users list:", err);
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Project fetch error:", err);
      setError(err.message);
    }
  }, [id, user]);

  // Fetch tasks for this project
  const fetchTasks = useCallback(async () => {
    if (!id) return;
    try {
      const allTasks = await TaskService.getAllTasks();
      const filtered = allTasks.filter(t => t.projectId === parseInt(id));
      setTasks(filtered);
      // If a task is selected, update it from the new list (or clear if deleted)
      if (selectedTask) {
        const updated = filtered.find(t => t.id === selectedTask.id);
        if (updated) {
          setSelectedTask(updated);
        } else {
          setSelectedTask(null);
        }
      }
    } catch (err) {
      console.error("Tasks fetch error:", err);
      // Show error only if critical
      setError(err.message);
    }
  }, [id, selectedTask]);

  // Fetch data on component mount or when project ID changes
  useEffect(() => {
    // Don't fetch until auth is initialized
    if (authLoading) return;
    // If user is not authenticated, redirect
    if (!user) {
      navigate('/login');
      return;
    }
    // Validate project ID
    if (!id) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }
    // Start loading
    setLoading(true);
    // Fetch project and tasks
    (async () => {
      await fetchProjectData();
      await fetchTasks();
      setLoading(false);
    })();
  }, [id, authLoading, navigate, user, fetchProjectData, fetchTasks]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show error if occurred
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If project data not found, show not found page
  if (!projectName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /**
   * Handler: Create a new task
   */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!hasPermission('create_edit_delete_tasks')) {
      alert('Not authorized to create tasks');
      return;
    }
    setIsSaving(true);
    try {
      const newTask = await TaskService.createTask({
        ...taskForm,
        projectId: parseInt(id),
        assigneeId: taskForm.assigneeId ? parseInt(taskForm.assigneeId) : null
      });
      console.log("Task created:", newTask);
      // Reset form and close modal
      setTaskForm({ title:'', description:'', status:'Pending', assigneeId:'' });
      setShowCreateTask(false);
      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error("Create task error:", err);
      alert(err.message || 'Failed to create task');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handler: Edit an existing task
   */
  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!hasPermission('create_edit_delete_tasks') && !hasPermission('view_update_tasks')) {
      alert('Not authorized to edit tasks');
      return;
    }
    setIsSaving(true);
    try {
      const updatedTask = await TaskService.updateTask(editingTask.id, {
        ...taskForm,
        assigneeId: taskForm.assigneeId ? parseInt(taskForm.assigneeId) : null
      });
      console.log("Task updated:", updatedTask);
      // Close modal
      setEditingTask(null);
      setTaskForm({ title:'', description:'', status:'Pending', assigneeId:'' });
      // Refresh tasks and selected task
      await fetchTasks();
      setSelectedTask(updatedTask);
    } catch (err) {
      console.error("Edit task error:", err);
      alert(err.message || 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handler: Delete a task
   */
  const handleDeleteTask = async (taskId) => {
    if (!hasPermission('create_edit_delete_tasks')) {
      alert('Not authorized to delete tasks');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await TaskService.deleteTask(taskId);
      console.log("Task deleted");
      // If deleted task was selected, clear it
      if (selectedTask?.id === taskId) setSelectedTask(null);
      // Refresh list
      await fetchTasks();
    } catch (err) {
      console.error("Delete task error:", err);
      alert(err.message || 'Failed to delete task');
    }
  };

  /**
   * Handler: Update task status (toggle Pending -> In Progress -> Completed)
   */
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!hasPermission('view_update_tasks')) {
      alert('Not authorized to update task status');
      return;
    }
    try {
      await TaskService.updateTask(taskId, { status: newStatus });
      console.log("Task status updated");
      await fetchTasks();
    } catch (err) {
      console.error("Update status error:", err);
      alert(err.message || 'Failed to update status');
    }
  };

  /**
   * Handler: Mark task as tested
   */
  const handleMarkTested = async (taskId) => {
    if (!hasPermission('mark_tested')) {
      alert('Not authorized to mark tasks as tested');
      return;
    }
    try {
      await TaskService.markAsTested(taskId);
      console.log("Task marked as tested");
      await fetchTasks();
    } catch (err) {
      console.error("Mark tested error:", err);
      alert(err.message || 'Failed to mark as tested');
    }
  };

  /**
   * Handler: Add a comment to the selected task
   */
  const handleAddComment = async () => {
    if (!hasPermission('add_comments') || !commentText.trim() || !selectedTask) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await TaskService.addComment(selectedTask.id, commentText.trim());
      console.log("Comment added:", newComment);
      // Prepend new comment to selectedTask comments
      setSelectedTask(prev => ({
        ...prev,
        Comments: [newComment, ...(prev.Comments || [])]
      }));
      setCommentText('');
    } catch (err) {
      console.error("Add comment error:", err);
      alert(err.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /**
   * Prepare form state for editing
   */
  const startEditing = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      assigneeId: task.assigneeId ? String(task.assigneeId) : ''
    });
  };

  // Task card component for the list
  const TaskCard = ({ task }) => (
    <div 
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
      onClick={() => (hasPermission('view_update_tasks') || hasPermission('read_only')) ? setSelectedTask(task) : null}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold text-base truncate">{task.title}</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
      </div>
      <p className="text-slate-300 text-xs mb-2 line-clamp-2">{task.description}</p>
      <div className="flex items-center text-xs text-slate-400">
        <User className="w-3 h-3 mr-1" />
        {task.assignee?.username || task.User?.username || 'Unassigned'}
      </div>
      <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {hasPermission('create_edit_delete_tasks') && (
          <button 
            onClick={e => { e.stopPropagation(); startEditing(task); }}
            className="p-1 hover:bg-blue-500/10 rounded"
            title="Edit Task"
          ><Edit3 className="w-4 h-4 text-blue-400" /></button>
        )}
        {hasPermission('view_update_tasks') && (
          <button 
            onClick={e => {
              e.stopPropagation();
              const newStatus = task.status === 'Pending' ? 'In Progress' 
                              : task.status === 'In Progress' ? 'Completed' : 'Pending';
              handleUpdateTaskStatus(task.id, newStatus);
            }}
            className="p-1 hover:bg-green-500/10 rounded"
            title="Update Status"
          ><CheckCircle className="w-4 h-4 text-green-400" /></button>
        )}
        {hasPermission('create_edit_delete_tasks') && (
          <button 
            onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}
            className="p-1 hover:bg-red-500/10 rounded"
            title="Delete Task"
          ><Trash2 className="w-4 h-4 text-red-400" /></button>
        )}
      </div>
    </div>
  );

  // Function to get styling classes based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': case 'tested': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'In Progress':                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Pending':                    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:                           return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top bar with back button and project title */}
      <nav className="p-4 flex justify-between items-center text-white">
        <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2">
          <ArrowLeft className="w-5 h-5" /><span>Dashboard</span>
        </button>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">{projectName}</h1>
          {projectRole && (
            <span className="px-2 py-1 bg-white/10 rounded-full text-xs">{projectRole}</span>
          )}
          <button 
            onClick={fetchTasks}
            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs border border-blue-500/30"
            title="Refresh Tasks"
          >
            Refresh
          </button>
        </div>
      </nav>

      {/* Main content: task list and task details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex space-x-6">
        {/* Left: Task list */}
        <div className="w-1/2">
          {hasPermission('create_edit_delete_tasks') && (
            <button onClick={() => setShowCreateTask(true)}
              className="mb-4 inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              <Plus className="w-4 h-4 mr-1"/> New Task
            </button>
          )}
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-16">
              <Clock className="w-12 h-12 mx-auto mb-4" />
              No tasks in this project.
            </div>
          )}
        </div>

        {/* Right: Selected task details */}
        {selectedTask && (
          <div className="w-1/2 bg-white/5 border border-white/20 rounded-xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedTask.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-white font-medium mb-1">Description</h3>
                <p className="text-gray-300">{selectedTask.description || 'No description'}</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Assignee</h3>
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="w-4 h-4"/> 
                  {selectedTask.assignee?.username || selectedTask.User?.username || 'Unassigned'}
                </div>
              </div>
              {(hasPermission('add_comments') || (selectedTask.Comments?.length > 0)) && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2"/> Comments
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                    {selectedTask.Comments?.map((c, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1 text-xs text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{c.User?.username} • {new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{c.text}</p>
                      </div>
                    ))}
                  </div>
                  {hasPermission('add_comments') && (
                    <div>
                      <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 text-sm mb-2"
                        rows="3"
                      />
                      <button onClick={handleAddComment}
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                      >
                        {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                {hasPermission('view_update_tasks') && (
                  <button onClick={() => {
                    const newStatus = selectedTask.status === 'Pending' ? 'In Progress' 
                                    : selectedTask.status === 'In Progress' ? 'Completed' : 'Pending';
                    handleUpdateTaskStatus(selectedTask.id, newStatus);
                  }} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                    Update Status
                  </button>
                )}
                {hasPermission('mark_tested') && selectedTask.status !== 'tested' && (
                  <button onClick={() => handleMarkTested(selectedTask.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                    Mark as Tested
                  </button>
                )}
                {hasPermission('create_edit_delete_tasks') && (
                  <button onClick={() => { startEditing(selectedTask); setSelectedTask(null); }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm">
                    Edit Task
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Task Modal */}
      {(showCreateTask || editingTask) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
            <button
              type="button"
              onClick={() => { setShowCreateTask(false); setEditingTask(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={editingTask ? handleEditTask : handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={e => setTaskForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Assignee</label>
                  <select
                    value={taskForm.assigneeId}
                    onChange={e => setTaskForm(p => ({ ...p, assigneeId: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                  >
                    <option value="">None</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.roles?.[0] || 'No role'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                  <button type="button" onClick={() => { setShowCreateTask(false); setEditingTask(null); }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                    Cancel
                  </button>
                  <button type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    {isSaving ? (editingTask ? 'Saving...' : 'Creating...') : (editingTask ? 'Save Changes' : 'Create Task')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
