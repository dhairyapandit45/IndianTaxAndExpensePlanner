import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Calculator, LayoutDashboard, Receipt } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] flex flex-col" id="landing-page">
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight">
            Tax & Expense Manager
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, lightweight full-stack personal finance organizer. Add income streams, monitor category-wise spending, declare budget caps with instant overflow notices, and compute the estimated liability difference between Old and New Indian tax slabs.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {user ?
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md shadow-sm transition border border-transparent"
              id="hero-dashboard-btn">
              
                Go to Dashboard
              </Link> :

            <>
                <Link
                to="/login"
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-md shadow-sm transition border border-transparent"
                id="hero-login-btn">
                
                  Sign In
                </Link>
                <Link
                to="/register"
                className="bg-white dark:bg-slate-800 hover:bg-gray-50 text-gray-800 dark:text-slate-100 font-semibold py-3 px-6 rounded-md shadow-sm transition border border-gray-300 dark:border-slate-600"
                id="hero-register-btn">
                
                  Create Account
                </Link>
              </>
            }
          </div>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 flex-grow">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
          Core Application Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow transition">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Income & Expense Logger</h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
              Add, update, and remove your financial items in tables. Categorize expenses and log payment dates under your secure private login.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow transition">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tax slab comparison</h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
              Compare Old vs. New tax slabs. Specify exemptions like standard deductions, HRA, home loan interest (24b), and Section 80C to fetch recommended regimes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow transition">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
              <LayoutDashboard className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Budgets</h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
              Set monthly budget caps. Receive clear colored warnings if current month spendings exceed your budget limit thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 text-center text-sm text-gray-500 dark:text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Tax & Expense Manager.</p>
        </div>
      </footer>
    </div>);

};

export default LandingPage;
