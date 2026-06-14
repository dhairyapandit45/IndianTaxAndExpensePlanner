import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { KeyRound, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please input both your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Invalid login details. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4" id="login-page">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-8 rounded-lg shadow-sm w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In to Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">Access your personal logs & calculations</p>
        </div>

        {localError &&
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-4 text-sm" id="login-error-banner">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        }

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. rahul@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email-input" />
            
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password-input" />
            
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-md transition shadow-sm text-sm"
            id="login-submit-btn">
            
            {loading ? 'Authenticating...' : 'Sign In Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm border-t border-gray-100 dark:border-slate-700/50 pt-4">
          <p className="text-gray-600 dark:text-slate-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>);

};

export default Login;
