import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { User, ShieldAlert, CheckCircle, KeyRound, Mail, Calendar, LogOut, Moon, Sun, Settings } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateProfileName } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Profile Details State
  const [profileName, setProfileName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Status logs
  const [nameError, setNameError] = useState(null);
  const [nameSuccess, setNameSuccess] = useState(null);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
    }
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(null);

    if (profileName.trim() === '') {
      setNameError('Please type a valid display name.');
      return;
    }

    setUpdatingName(true);
    try {
      const res = await api.put('/users/profile', { name: profileName });
      updateProfileName(res.data.name);
      setNameSuccess('Display name successfully updated.');
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed updating name.');
    } finally {
      setUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwdError('Please fill in all passcode fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdError('Confirm password does not match.');
      return;
    }

    if (newPassword.length < 4) {
      setPwdError('New password must be at least 4 characters long.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      setPwdSuccess(res.data.message || 'Password successfully changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Error occurred updating password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8" id="profile-view">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="border-b border-gray-200 dark:border-slate-700 pb-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Your Account</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Control displayed profile parameters, reset passwords, or sign out.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Account Snapshot Info Card */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm space-y-5 h-fit">
            <div className="text-center pb-4 border-b border-gray-100 dark:border-slate-700/50">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-150 text-blue-700 flex items-center justify-center font-bold text-xl mb-3 border border-blue-200">
                {user?.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user?.name}</h3>
              <span className="text-xs bg-gray-100 dark:bg-slate-800 px-2.5 py-1 text-gray-500 dark:text-slate-400 rounded-full font-mono mt-1 inline-block">
                Registered User
              </span>
            </div>

            <div className="space-y-3.5 text-sm text-gray-650 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Joined Secure Portal</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-semibold text-xs py-2 rounded-md transition mt-4 flex items-center justify-center gap-1.5"
              id="profile-logout-btn">
              
              <LogOut className="w-4 h-4" />
              Sign Out Securely
            </button>
          </div>

          {/* Settings Side */}
          <div className="md:col-span-2 space-y-6">

            {/* App Preferences Card */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm space-y-4">
              <h3 className="font-bold text-md text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 flex items-center gap-1.5">
                <Settings className="w-4.5 h-4.5 text-blue-600" />
                App Preferences
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Theme Appearance</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Toggle between light and dark mode.</p>
                </div>
                
                <button 
                  onClick={toggleTheme}
                  className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center justify-center border border-gray-200 dark:border-slate-600"
                  aria-label="Toggle Dark Mode">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Change Profile details Card */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm space-y-4">
              <h3 className="font-bold text-md text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 flex items-center gap-1.5">
                <User className="w-4.5 h-4.5 text-blue-600" />
                Update Profile Name
              </h3>

              {nameError &&
              <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-2 text-xs" id="profile-name-err">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{nameError}</span>
                </div>
              }

              {nameSuccess &&
              <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 flex items-center gap-2 mb-2 text-xs" id="profile-name-ok">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{nameSuccess}</span>
                </div>
              }

              <form onSubmit={handleUpdateName} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Display Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Rahul Sharma"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    id="profile-name-input" />
                  
                </div>

                <button
                  type="submit"
                  disabled={updatingName}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs px-4 py-2 rounded-md transition shadow-sm"
                  id="profile-name-submit">
                  
                  {updatingName ? 'Applying change...' : 'Save Display Name'}
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm space-y-4">
              <h3 className="font-bold text-md text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 flex items-center gap-1.5">
                <KeyRound className="w-4.5 h-4.5 text-blue-600" />
                Change Account Password
              </h3>

              {pwdError &&
              <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-2 text-xs" id="profile-pwd-err">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{pwdError}</span>
                </div>
              }

              {pwdSuccess &&
              <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 flex items-center gap-2 mb-2 text-xs" id="profile-pwd-ok">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              }

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Old Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    id="profile-old-pwd" />
                  
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      id="profile-new-pwd" />
                    
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Confirm New</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      id="profile-confirm-new-pwd" />
                    
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs px-4 py-2 rounded-md transition shadow-sm"
                  id="profile-pwd-submit">
                  
                  {updatingPassword ? 'Changing password...' : 'Reset Secure Password'}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>);

};

export default Profile;
