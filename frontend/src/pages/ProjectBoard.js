// === FRONTEND — ProjectBoard.js ===

import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const allowedRoles = ['Admin', 'Project Manager', 'Developer', 'Tester', 'Viewer'];

export default function ProjectBoard() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isAuthorized = userRoles.some(role => allowedRoles.includes(role));

  useEffect(() => {
    if (id) {
      api.get(`/projects/${id}`).then(res => setProject(res.data));
      api.get(`/tasks?projectId=${id}`).then(res => setTasks(res.data));
    }
  }, [id]);

  if (!isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!project) return <p className="text-white">Loading...</p>;

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold">{project.name}</h2>
      <p>{project.description}</p>

      <div className="mt-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-white/10 p-4 my-2 rounded">
            <h3 className="font-bold">{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>

            {user?.permissions?.includes('task:edit') && (
              <button className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
            )}

            {user?.permissions?.includes('task:test') && task.status !== 'tested' && (
              <button className="bg-yellow-600 text-white px-3 py-1 rounded ml-2">Mark as Tested</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}