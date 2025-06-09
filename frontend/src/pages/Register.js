import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', { username, password });
      navigate('/login');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      <video autoPlay loop muted playsInline className="absolute inset-0 object-cover w-full h-full z-0">
        <source src="https://cdn.pixabay.com/video/2020/01/25/31569-387675206_tiny.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-white/60 mb-6">Join us and start your journey</p>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField icon={<User />} value={username} setValue={setUsername} placeholder="Username" />
          <PasswordField
            value={password}
            setValue={setPassword}
            show={showPassword}
            setShow={setShowPassword}
            placeholder="Password"
          />
          <PasswordField
            value={confirmPassword}
            setValue={setConfirmPassword}
            show={showConfirmPassword}
            setShow={setShowConfirmPassword}
            placeholder="Confirm Password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:from-green-600 hover:to-blue-600 transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign Up <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-white/70 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline transition">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const InputField = ({ icon, value, setValue, placeholder }) => (
  <div className="relative">
    {React.cloneElement(icon, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-white/50", size: 18 })}
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition"
      required
    />
  </div>
);

const PasswordField = ({ value, setValue, show, setShow, placeholder }) => (
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
    <input
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition"
      required
    />
    <button
      type="button"
      onClick={() => setShow(!show)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);
