import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SampleProjectLink() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    const role = user?.roles?.[0];

    if (role === 'Admin') navigate('/admin');
    else if (role === 'Project Manager') navigate('/pm');
    else if (role === 'Developer') navigate('/dev');
    else if (role === 'Tester') navigate('/tester');
    else navigate('/viewer');
  };

  return (
    <div onClick={handleClick} className="group cursor-pointer hover:text-blue-500">
      Sample Project
    </div>
  );
}
