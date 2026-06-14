import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Navbar from './components/common/Navbar.jsx';

// Page Imports
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Income from './pages/Income.jsx';
import Budgets from './pages/Budgets.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import TaxModule from './pages/TaxModule.jsx';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col font-sans" id="app-root">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/expenses"
                element={
                <ProtectedRoute>
                    <Expenses />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/income"
                element={
                <ProtectedRoute>
                    <Income />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/tax-module"
                element={
                <ProtectedRoute>
                    <TaxModule />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/budgets"
                element={
                <ProtectedRoute>
                    <Budgets />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/subscriptions"
                element={
                <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/reports"
                element={
                <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/profile"
                element={
                <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              

              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>);

}
