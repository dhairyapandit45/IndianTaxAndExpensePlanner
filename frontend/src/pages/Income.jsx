import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { Edit2, Trash2, AlertCircle, Calendar } from 'lucide-react';

const INCOME_SOURCES = [
'Monthly Salary',
'Business Profit',
'Freelance Work',
'Investments / Stocks',
'Family Help / Pocket Money',
'Other Sources'];


const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form Fields
  const [idToEdit, setIdToEdit] = useState(null);
  const [source, setSource] = useState(INCOME_SOURCES[0]);
  const [customSource, setCustomSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/income');
      setIncomes(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch income logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleClearForm = () => {
    setIdToEdit(null);
    setSource(INCOME_SOURCES[0]);
    setCustomSource('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const activeSource = source === 'Other Sources' ? customSource.trim() : source;

    if (!activeSource || !amount || !date) {
      setErrorMsg('Please resolve all mandatory fields.');
      return;
    }

    if (Number(amount) <= 0) {
      setErrorMsg('Income amount must be a positive number.');
      return;
    }

    setSubmitting(true);
    const body = {
      source: activeSource,
      amount: Number(amount),
      date
    };

    try {
      if (idToEdit) {
        // Edit flow
        const res = await api.put(`/income/${idToEdit}`, body);
        setIncomes(incomes.map((inc) => inc._id === idToEdit ? res.data : inc));
        handleClearForm();
      } else {
        // Create flow
        const res = await api.post('/income', body);
        setIncomes([res.data, ...incomes]);
        handleClearForm();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (inc) => {
    setIdToEdit(inc._id);
    if (INCOME_SOURCES.includes(inc.source)) {
      setSource(inc.source);
      setCustomSource('');
    } else {
      setSource('Other Sources');
      setCustomSource(inc.source);
    }
    setAmount(String(inc.amount));
    setDate(inc.date);
    setErrorMsg(null);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) {
      return;
    }

    try {
      await api.delete(`/income/${id}`);
      setIncomes(incomes.filter((inc) => inc._id !== id));
      if (idToEdit === id) {
        handleClearForm();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error deleting income entry.');
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
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8" id="incomes-view">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="border-b border-gray-200 dark:border-slate-700 pb-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Income</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Control, log, or record cash earnings and salaries.</p>
        </div>

        {errorMsg &&
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-4 text-sm" id="income-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        }

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm h-fit">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 mb-4">
              {idToEdit ? 'Edit Income Details' : 'Log New Income'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Income Source Select*</label>
                <select
                  className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition capitalize"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  id="income-source-select">
                  
                  {INCOME_SOURCES.map((src) =>
                  <option key={src} value={src}>
                      {src}
                    </option>
                  )}
                </select>
              </div>

              {source === 'Other Sources' &&
              <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Explain Custom Source*</label>
                  <input
                  type="text"
                  placeholder="e.g. Scholarship award"
                  className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  required
                  id="income-custom-source-input" />
                
                </div>
              }

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-655 uppercase mb-1">Amount (INR)*</label>
                  <input
                    type="number"
                    placeholder="In rupees"
                    className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    id="income-amount-input" />
                  
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-655 uppercase mb-1">Received Date*</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    id="income-date-input" />
                  
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-grow bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-md transition text-xs shadow-sm"
                  id="income-submit-btn">
                  
                  {submitting ? 'Saving entry...' : idToEdit ? 'Update Details' : 'Log Earnings'}
                </button>
                {idToEdit &&
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-semibold px-3 py-2 rounded-md hover:bg-gray-55 text-xs transition"
                  id="income-cancel-btn">
                  
                    Cancel
                  </button>
                }
              </div>
            </form>
          </div>

          {/* List Card */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3">
              Logged Incomes List
            </h3>

            {loading ?
            <div className="py-12 text-center text-gray-500 dark:text-slate-400 text-xs">
                Refreshing income listings...
              </div> :
            incomes.length === 0 ?
            <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                No income logged. Fill out the form to add your source details.
              </div> :

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold bg-gray-50 dark:bg-slate-900">
                      <th className="py-2.5 px-3">Earning Source</th>
                      <th className="py-2.5 px-3">Received Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomes.map((inc) =>
                  <tr key={inc._id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 transition">
                        <td className="py-3.5 px-3 font-bold text-gray-900 dark:text-white capitalize">
                          {inc.source}
                        </td>
                        <td className="py-3.5 px-3 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                            {inc.date}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-green-600 whitespace-nowrap">
                          {formatRupees(inc.amount)}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                          onClick={() => handleEditClick(inc)}
                          className="text-gray-500 dark:text-slate-400 hover:text-blue-600 p-1 rounded-md bg-gray-50 dark:bg-slate-900 hover:bg-blue-50 border border-gray-200 dark:border-slate-700 transition"
                          title="Edit details">
                          
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                          onClick={() => handleDeleteClick(inc._id)}
                          className="text-gray-500 dark:text-slate-400 hover:text-red-600 p-1 rounded-md bg-gray-50 dark:bg-slate-900 hover:bg-red-50 border border-gray-200 dark:border-slate-700 transition"
                          title="Delete entry">
                          
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }
          </div>

        </div>

      </div>
    </div>);

};

export default Income;
