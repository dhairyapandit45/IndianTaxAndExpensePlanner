import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { CreditCard, PlusCircle, AlertCircle, RefreshCw, Trash2, Pencil } from 'lucide-react';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Housing');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get('/subscriptions');
      // Assume res.data is an array or object containing the list
      const data = Array.isArray(res.data) ? res.data : (res.data?.subscriptions || []);
      setSubscriptions(data);
    } catch (err) {
      // Don't show error if it's 404 (maybe endpoint not implemented yet)
      if (err.response?.status !== 404) {
        setErrorMsg('Failed to load subscriptions.');
      } else {
        setSubscriptions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Amount must be a positive number.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/subscriptions/${editingId}`, {
          title,
          amount: numericAmount,
          category,
          frequency,
          nextDueDate
        });
      } else {
        await api.post('/subscriptions', {
          title,
          amount: numericAmount,
          category,
          frequency,
          nextDueDate
        });
      }

      // reset form
      setTitle('');
      setAmount('');
      setCategory('Housing');
      setFrequency('monthly');
      setNextDueDate('');
      setEditingId(null);
      fetchSubscriptions();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving subscription.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (sub) => {
    setEditingId(sub._id);
    setTitle(sub.title);
    setAmount(sub.amount);
    setCategory(sub.category || 'Housing');
    setFrequency(sub.frequency);

    // Format date for date input (YYYY-MM-DD)
    if (sub.nextDueDate) {
      const d = new Date(sub.nextDueDate);
      setNextDueDate(d.toISOString().split('T')[0]);
    } else {
      setNextDueDate('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (err) {
      setErrorMsg('Failed to delete subscription.');
    }
  };

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="border-b border-gray-200 dark:border-slate-700 pb-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Subscriptions</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Keep track of your recurring expenses and bills.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm lg:col-span-1 h-fit">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              {editingId ? 'Edit Subscription' : 'Add Subscription'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 uppercase mb-1">Service Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Netflix, Gym"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 uppercase mb-1">Amount (INR)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 uppercase mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Housing">Housing</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 uppercase mb-1">Frequency</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-md transition text-sm shadow-sm flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : (editingId ? 'Update Subscription' : 'Add Subscription')}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setAmount('');
                    setCategory('Housing');
                    setFrequency('monthly');
                    setNextDueDate('');
                  }}
                  className="w-full bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 font-semibold py-2 rounded-md transition text-sm shadow-sm flex items-center justify-center mt-2"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm lg:col-span-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              Active Subscriptions
            </h3>

            {loading ? (
              <div className="py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                Loading subscriptions...
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-slate-400 text-sm bg-gray-50 dark:bg-slate-900 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                No active subscriptions found. Add one to get started!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold bg-gray-50 dark:bg-slate-900">
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Frequency</th>
                      <th className="py-3 px-4">Start Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub, idx) => (
                      <tr key={sub._id || idx} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{sub.title}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-slate-300 capitalize">
                          <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100 px-2 py-1 rounded-full">
                            {sub.frequency}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-slate-300">
                          {sub.nextDueDate ? new Date(sub.nextDueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                          {formatRupees(sub.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(sub)}
                              className="text-gray-500 dark:text-slate-400 hover:text-blue-600 p-1 rounded-md bg-gray-50 dark:bg-slate-900 hover:bg-blue-50 border border-gray-200 dark:border-slate-700 transition"
                              title="Edit subscription">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub._id)}
                              className="text-gray-500 dark:text-slate-400 hover:text-red-600 p-1 rounded-md bg-gray-50 dark:bg-slate-900 hover:bg-red-50 border border-gray-200 dark:border-slate-700 transition"
                              title="Delete subscription">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
