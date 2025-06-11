// src/services/TaskService.js
import api from './api';

const TaskService = {
  // Fetch all tasks for a project from backend
  getTasks: async (projectId) => {
    const response = await api.get(`/tasks?projectId=${projectId}`);
    return response.data;
  },

  // Create a new task
  createTask: async (task) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  // Update an existing task
  updateTask: async (id, updates) => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  // Delete a task by id
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Fetch comments for a specific task
  getComments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  // Post a new comment on a task
  postComment: async (taskId, comment) => {
    const response = await api.post(`/tasks/${taskId}/comments`, comment);
    return response.data;
  }
};

export default TaskService;
