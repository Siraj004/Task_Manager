import React, { useEffect, useState } from 'react';

function Landing({ accessToken }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProtected = async () => {
      try {
        const res = await fetch('http://localhost:5000/auth/protected', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + accessToken
          },
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message);
        } else {
          setMessage(data.message || 'Failed to load protected content');
        }
      } catch (err) {
        setMessage('Server error');
      }
    };
    fetchProtected();
  }, [accessToken]);

  const handleLogout = async () => {
    await fetch('http://localhost:5000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/login';
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-4">Landing Page</h2>
      <p>{message}</p>
      <button onClick={handleLogout} className="mt-4 bg-red-500 text-white py-2">
        Logout
      </button>
    </div>
  );
}

export default Landing;
