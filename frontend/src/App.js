import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Landing from './Landing';

function App() {
  const [accessToken, setAccessToken] = React.useState('');

  const handleLogin = (token) => {
    setAccessToken(token);
  };

  return (
    <Router>
      <nav className="p-4 bg-gray-800 text-white">
        <Link className="mr-4" to="/login">Login</Link>
        <Link className="mr-4" to="/register">Register</Link>
        <Link to="/landing">Landing</Link>
      </nav>
      <div className="p-4">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/landing"
            element={
              accessToken ? <Landing accessToken={accessToken} /> : <Navigate to="/login" />
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
