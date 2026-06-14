import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { Edit2, Trash2, AlertCircle, Calendar } from 'lucide-react';
import AIChatAssistant from '../components/common/AIChatAssistant.jsx';

const EXPENSE_CATEGORIES = [
'Food & Groceries',
'Rent & Accommodation',
'Utilities & Bills',
'Transport',
'Entertainment',
'Education',
'Shopping',
'Healthcare',
'Others'];


const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form Fields
  const [idToEdit, setIdToEdit] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  
  // Filtering
  const [filterMonth, setFilterMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleClearForm = () => {
    setIdToEdit(null);
    setTitle('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title || !amount || !category || !date) {
      setErrorMsg('Please complete all mandatory fields.');
      return;
    }

    if (Number(amount) <= 0) {
      setErrorMsg('Expense amount must be a positive number.');
      return;
    }

    setSubmitting(true);
    const body = {
      title,
      amount: Number(amount),
      category,
      date,
      notes
    };

    try {
      if (idToEdit) {
        // Edit flow
        const res = await api.put(`/expenses/${idToEdit}`, body);
        setExpenses(expenses.map((exp) => exp._id === idToEdit ? res.data : exp));
        handleClearForm();
      } else {
        // Create flow
        const res = await api.post('/expenses', body);
        setExpenses([res.data, ...expenses]);
        handleClearForm();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (exp) => {
    setIdToEdit(exp._id);
    setTitle(exp.title);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setDate(exp.date);
    setNotes(exp.notes || '');
    setErrorMsg(null);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((exp) => exp._id !== id));
      if (idToEdit === id) {
        handleClearForm();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while deleting.');
    }
  };

  const formatRupees = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const availableMonths = Array.from(new Set(expenses.map(e => e.date && e.date.slice(0, 7)))).filter(Boolean).sort((a,b) => b.localeCompare(a));
  const displayedExpenses = filterMonth === 'All Time' ? expenses : expenses.filter(e => e.date && e.date.startsWith(filterMonth));

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8" id="expenses-view">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="border-b border-gray-200 dark:border-slate-700 pb-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Expenses</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Control, log, or revise your category-wise spending streams.</p>
        </div>

        {errorMsg &&
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-4 text-sm" id="expense-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        }

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Form Card */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm h-fit">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 mb-4">
              {idToEdit ? 'Edit Selected Expense' : 'Log New Expense'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Expense Title*</label>
                <input
                  type="text"
                  placeholder="e.g. Hostels Dinner / Electricity bill"
                  className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  id="expense-title-input" />
                
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Amount (INR)*</label>
                  <input
                    type="number"
                    placeholder="INR Value"
                    className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    id="expense-amount-input" />
                  
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Expense Date*</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    id="expense-date-input" />
                  
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Category*</label>
                <select
                  className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition capitalize"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  id="expense-category-input">
                  
                  {EXPENSE_CATEGORIES.map((cat) =>
                  <option key={cat} value={cat}>
                      {cat}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Additional Notes</label>
                <textarea
                  placeholder="Optional brief remarks"
                  rows={3}
                  className="w-full px-3 py-2 border border-blue-100 bg-gray-50 dark:bg-slate-900 hover:bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  id="expense-notes-input" />
                
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-grow bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-md transition text-xs shadow-sm"
                  id="expense-submit-btn">
                  
                  {submitting ? 'Saving record...' : idToEdit ? 'Update Expense' : 'Log Expense'}
                </button>
                {idToEdit &&
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-semibold px-3 py-2 rounded-md hover:bg-gray-55 text-xs transition"
                  id="expense-cancel-btn">
                  
                    Cancel
                  </button>
                }
              </div>
            </form>
          </div>

            <AIChatAssistant expenses={expenses} />
          </div>

          {/* List Side */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm lg:col-span-2 space-y-4 h-fit">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/50 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Logged Expenses List
              </h3>
              <select 
                  className="text-xs border border-gray-200 dark:border-slate-700 rounded px-2 py-1 outline-none text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-900 font-medium cursor-pointer"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option value="All Time">All Time</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  {!availableMonths.includes(filterMonth) && filterMonth !== 'All Time' && (
                    <option value={filterMonth}>{filterMonth}</option>
                  )}
              </select>
            </div>

            {loading ?
            <div className="py-12 text-center text-gray-500 dark:text-slate-400 text-xs">
                Refreshing transaction listings...
              </div> :
            displayedExpenses.length === 0 ?
            <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                No logged expenses found for {filterMonth}.
              </div> :

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold bg-gray-50 dark:bg-slate-900">
                      <th className="py-2.5 px-3">Title / Details</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedExpenses.map((exp) =>
                  <tr key={exp._id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 transition">
                        <td className="py-3 px-3">
                          <p className="font-bold text-gray-900 dark:text-white">{exp.title}</p>
                          {exp.notes && <p className="text-[11px] text-gray-400 dark:text-slate-500 italic mt-0.5">{exp.notes}</p>}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100 px-2.5 py-1 rounded-full capitalize">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                            {exp.date}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-red-600 whitespace-nowrap">
                          {formatRupees(exp.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                          onClick={() => handleEditClick(exp)}
                          className="text-gray-500 dark:text-slate-400 hover:text-blue-600 p-1 rounded-md bg-gray-50 dark:bg-slate-900 hover:bg-blue-50 border border-gray-200 dark:border-slate-700 transition"
                          title="Edit record">
                          
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                          onClick={() => handleDeleteClick(exp._id)}
                          className="text-gray-500 dark:text-slate-400 hover:text-red-600 p-1 rounded-md bg-gray-50 dark:bg-slate-900 hover:bg-red-50 border border-gray-200 dark:border-slate-700 transition"
                          title="Delete record">
                          
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

export default Expenses;
