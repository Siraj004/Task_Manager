import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const roles = ['Admin', 'Project Manager', 'Developer', 'Tester', 'Viewer'];

  useEffect(() => {
    // Fetch users from the backend
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch {}
    };
    fetchUsers();
  }, []);

  const updateRole = async (userId, role) => {
    await api.put(`/admin/users/${userId}/roles`, { roles: [role] });
    // Optionally refresh list after update
    const res = await api.get('/admin/users');
    setUsers(res.data);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <span className="text-gray-800">{u.username}</span>
            <select
              value={u.roles[0]?.name || 'Viewer'}
              onChange={e => updateRole(u.id, e.target.value)}
              className="ml-2 border px-2 py-1 rounded"
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
