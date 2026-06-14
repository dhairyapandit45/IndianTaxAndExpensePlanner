import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { UserCheck, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill out all input fields.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 4) {
      setLocalError('Password must contain at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Try changing the email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4" id="register-page">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-8 rounded-lg shadow-sm w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create an Account</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Create an account to manage your finance files</p>
        </div>

        {localError &&
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-4 text-sm" id="register-error-banner">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        }

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              id="register-name-input" />
            
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. rahul@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="register-email-input" />
            
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
              id="register-password-input" />
            
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              id="register-confirm-input" />
            
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-md transition shadow-sm text-sm"
            id="register-submit-btn">
            
            {loading ? 'Processing Registration...' : 'Register Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm border-t border-gray-100 dark:border-slate-700/50 pt-4">
          <p className="text-gray-600 dark:text-slate-300">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>);

};

export default Register;
