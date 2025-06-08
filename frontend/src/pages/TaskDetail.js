// FILE: frontend/src/pages/TaskDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    api.get(`/tasks/${id}`).then(res => setTask(res.data));
    api.get(`/tasks/${id}/comments`).then(res => setComments(res.data));
  }, [id]);

  const submitComment = async () => {
    await api.post(`/tasks/${id}/comments`, { text });
    const res = await api.get(`/tasks/${id}/comments`);
    setComments(res.data);
    setText('');
  };

  const canComment =
    user?.permissions?.includes('task:comment') ||
    ['Developer', 'Tester', 'Admin'].some(r => user?.roles.includes(r));

  if (!task) return <p className="text-white">Loading task...</p>;

  return (
    <div className="p-6 text-white bg-slate-900 min-h-screen">
      <h2 className="text-2xl font-bold">{task.title}</h2>
      <p className="text-gray-300">{task.description}</p>
      <p className="mt-2">Status: <strong>{task.status}</strong></p>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Comments</h3>
        <ul className="mt-2 space-y-2">
          {comments.map(c => (
            <li key={c.id} className="border-b pb-2 border-white/20">{c.text} — <em>by user {c.userId}</em></li>
          ))}
        </ul>

        {canComment && (
          <div className="mt-4">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border border-white/30 bg-white/10 p-2 rounded text-white"
            />
            <button
              onClick={submitComment}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Post Comment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
