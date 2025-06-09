// src/services/TaskService.js
const API_URL = '/api/tasks';

const TaskService = {
  // Fetch all tasks from backend
  getTasks: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  // Create a new task
  createTask: async (task) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  // Update an existing task
  updateTask: async (id, updates) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  // Delete a task by id
  deleteTask: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  },

  // Fetch comments for a specific task
  getComments: async (taskId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${taskId}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  // Post a new comment on a task
  postComment: async (taskId, comment) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(comment)
    });
    if (!response.ok) throw new Error('Failed to post comment');
    return response.json();
  }
};

export default TaskService;
