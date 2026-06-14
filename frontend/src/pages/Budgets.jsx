import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { ShieldAlert, AlertTriangle, CheckCircle, Save } from 'lucide-react';

const Budgets = () => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const yearStr = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    return `${yearStr}-${monthStr}`; // "YYYY-MM"
  });

  const [limitInput, setLimitInput] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchBudgetStatus = async (selectedMonth) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await api.get(`/budgets/${selectedMonth}`);
      const limit = res.data.budget?.limit || 0;
      setCurrentLimit(limit);
      setLimitInput(limit > 0 ? String(limit) : '');
      setTotalSpent(res.data.totalSpent || 0);
    } catch (err) {
      setErrorMsg('Failed to load budget record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetStatus(month);
  }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (limitInput === '') {
      setErrorMsg('Please input a valid budget limit amount.');
      return;
    }

    const numericLimit = Number(limitInput);
    if (isNaN(numericLimit) || numericLimit < 0) {
      setErrorMsg('Budget limit must be a positive number.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/budgets', {
        month,
        limit: numericLimit
      });
      setCurrentLimit(res.data.limit);
      setSuccessMsg(`Budget limits for ${month} successfully adjusted!`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving budget.');
    } finally {
      setSaving(false);
    }
  };

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isExceeded = currentLimit > 0 && totalSpent > currentLimit;
  const remaining = currentLimit - totalSpent;
  const ratio = currentLimit > 0 ? totalSpent / currentLimit * 100 : 0;

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8" id="budgets-view">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="border-b border-gray-200 dark:border-slate-700 pb-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Budget Manager</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Control monthly spending, monitor remaining shields, and manage overflow alarms.</p>
        </div>

        {errorMsg &&
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-4 text-sm" id="budget-error">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        }

        {successMsg &&
        <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 flex items-center gap-2 mb-4 text-sm" id="budget-success">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        }

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Form Side */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm md:col-span-1 h-fit">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 mb-4">
              Set Month Limit
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-750 uppercase mb-1">Target Month</label>
                <input
                  type="month"
                  className="w-full px-3 py-2 border border-gray-350 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required />
                
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-750 uppercase mb-1">Budget Threshold (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  className="w-full px-3 py-2 border border-gray-350 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  min="0"
                  required
                  id="budget-limit-input" />
                
              </div>

              <button
                type="submit"
                disabled={saving || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-md transition text-xs shadow-sm flex items-center justify-center gap-1.5"
                id="budget-submit-btn">
                
                <Save className="w-4 h-4" />
                {saving ? 'Adjusting limit...' : 'Save Limit Cap'}
              </button>
            </form>
          </div>

          {/* Display Side */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm md:col-span-2 space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 flex items-center justify-between">
              <span>Limit Status for: <strong className="text-blue-700">{month}</strong></span>
              <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-mono px-2 py-1 rounded">Check details</span>
            </h3>

            {loading ?
            <div className="py-12 text-center text-gray-500 dark:text-slate-400 text-xs">
                Analyzing monthly ledger...
              </div> :

            <div className="space-y-6" id="budget-status-details">
                
                {/* Budget Warning state */}
                {currentLimit === 0 ?
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-center text-sm text-yellow-805">
                    No budget configured for <strong className="font-bold">{month}</strong>. Enter an amount on the left to activate notifications.
                  </div> :
              isExceeded ?
              <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-900" id="budget-warning-red">
                    <h4 className="font-medium text-lg flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      BUDGET EXCEEDED WARNING!
                    </h4>
                    <p className="text-xs text-red-700 mt-2">
                      Your current monthly expenses of <strong className="font-semibold text-red-900">{formatRupees(totalSpent)}</strong> exceed your configured shield limit of <strong className="font-semibold text-red-900">{formatRupees(currentLimit)}</strong>! Reduce unnecessary expenditures.
                    </p>
                  </div> :

              <div className="bg-green-50 border border-green-200 p-4 rounded-md text-green-900">
                    <h4 className="font-medium text-md flex items-center gap-1.5 font-bold">
                      <CheckCircle className="w-5 h-5 text-green-700" />
                      Budget Spending Normal
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      You are in bounds. Logged spendings total <strong className="font-bold text-green-950">{formatRupees(totalSpent)}</strong>, leaving you a safe cushion of <strong className="font-bold text-green-950">{formatRupees(remaining)}</strong>.
                    </p>
                  </div>
              }

                {/* Slabs breakdown details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-150 dark:border-slate-700 rounded-lg p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Set Limit Amount</span>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{currentLimit > 0 ? formatRupees(currentLimit) : 'Not configured'}</p>
                  </div>
                  <div className="border border-gray-150 dark:border-slate-700 rounded-lg p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Actually spent till date</span>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatRupees(totalSpent)}</p>
                  </div>
                </div>

                {currentLimit > 0 &&
              <div className="space-y-2 border-t border-gray-100 dark:border-slate-700/50 pt-4">
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-slate-300">
                      <span>Expenditure Gauge</span>
                      <span>
                        {ratio.toFixed(0)}% ({formatRupees(totalSpent)} / {formatRupees(currentLimit)})
                      </span>
                    </div>
                    {/* Visual Meter bar */}
                    <div className="w-full bg-gray-250 rounded-full h-3.5 overflow-hidden border border-gray-150 dark:border-slate-700">
                      <div
                    className={`h-full transition-all duration-300 ${isExceeded ? 'bg-red-650' : ratio > 80 ? 'bg-orange-550' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(ratio, 100)}%` }}>
                  </div>
                    </div>
                  </div>
              }

              </div>
            }
          </div>

        </div>

      </div>
    </div>);

};

export default Budgets;
