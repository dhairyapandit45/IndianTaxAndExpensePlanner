import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut, User as UserIcon, Wallet } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ?
    'bg-blue-600 text-white font-medium px-3 py-2 rounded-md text-sm' :
    'text-gray-700 dark:text-slate-200 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm transition';
  };

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-xl text-blue-700">
              <Wallet className="w-6 h-6 text-blue-600" />
              <span>Tax & Expense Manager</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ?
            <div className="hidden md:flex items-center gap-1 lg:gap-3">
                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                <Link to="/expenses" className={isActive('/expenses')}>Expenses</Link>
                <Link to="/income" className={isActive('/income')}>Income</Link>
                <Link to="/tax-module" className={isActive('/tax-module')}>Tax Planner</Link>
                <Link to="/budgets" className={isActive('/budgets')}>Budgets</Link>
                <Link to="/subscriptions" className={isActive('/subscriptions')}>Subscriptions</Link>
                <Link to="/reports" className={isActive('/reports')}>Reports</Link>
                <Link to="/profile" className={isActive('/profile')}>Profile</Link>
                
                <div className="h-6 w-[1px] bg-gray-200 dark:bg-slate-700 mx-1"></div>
                
                <span className="text-gray-600 dark:text-slate-300 text-sm font-medium flex items-center gap-1 border border-gray-200 dark:border-slate-700 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-slate-900">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  Hi, {user.name}
                </span>

                <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md font-medium border border-red-200 transition"
                id="navbar-logout-btn">
                
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div> :

            <div className="flex items-center gap-3">
                <Link
                to="/login"
                className="text-gray-700 dark:text-slate-200 hover:text-blue-600 text-sm font-medium px-3 py-2"
                id="navbar-login-link">
                
                  Login
                </Link>
                <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition border border-transparent shadow-sm"
                id="navbar-register-link">
                
                  Register
                </Link>
              </div>
            }
          </div>
        </div>

        {/* Mobile Sub-Navigation for logged in users */}
        {user &&
        <div className="md:hidden flex flex-wrap justify-center border-t border-gray-100 dark:border-slate-700/50 py-2 gap-1 bg-white dark:bg-slate-800">
            <Link to="/dashboard" className="text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 px-2 py-1 rounded">Dashboard</Link>
            <Link to="/expenses" className="text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 px-2 py-1 rounded">Expenses</Link>
            <Link to="/income" className="text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 px-2 py-1 rounded">Income</Link>
            <Link to="/tax-module" className="text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 px-2 py-1 rounded">Tax Planner</Link>
            <Link to="/budgets" className="text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 px-2 py-1 rounded">Budgets</Link>
            <Link to="/subscriptions" className="text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 px-2 py-1 rounded">Subscriptions</Link>
            <Link to="/reports" className="text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 px-2 py-1 rounded">Reports</Link>
            <Link to="/profile" className="text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 px-2 py-1 rounded">Profile</Link>
            <button
            onClick={handleLogout}
            className="text-xs text-red-600 font-medium px-2 py-1">
            
              Logout
            </button>
          </div>
        }
      </div>
    </nav>);

};

export default Navbar;
