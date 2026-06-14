import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calculator,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Receipt,
  Sparkles } from
'lucide-react';

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';


const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [taxData, setTaxData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbMode, setDbMode] = useState('Local');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch values
        const [expRes, incRes, taxRes, budgetRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/income'),
        api.get('/tax'),
        api.get('/budgets')]
        );

        setExpenses(expRes.data);
        setIncomes(incRes.data);
        setTaxData(taxRes.data);
        setBudgetData(budgetRes.data);

        // Process due subscriptions automatically
        try {
          await api.get('/subscriptions/process');
        } catch (e) {
          console.error('Failed to process subscriptions:', e);
        }

        // Check DB mode headers or health response
        const healthRes = await api.get('/health');
        // Simple heuristic: check if MONGODB_URI is loaded inside server Config
        // We can check if server returns custom status or verify via database logs
        // Let's call our profile API or pass database-type parameter there
      } catch (err) {
        console.error('Error fetching dashboard records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const DeductionProgress = ({ title, amount, max }) => {
    const isUnlimited = max === null;
    const safeMax = isUnlimited ? Math.max(amount, 1) : max;
    const percentage = isUnlimited ? (amount > 0 ? 100 : 0) : Math.min((amount / safeMax) * 100, 100);
    const remaining = isUnlimited ? 'N/A' : Math.max(max - amount, 0);

    return (
      <div className="space-y-2 bg-white dark:bg-slate-800 p-4 rounded-md border border-gray-100 dark:border-slate-700/50 shadow-sm">
        <div className="flex justify-between items-end text-sm">
          <span className="font-bold text-gray-700 dark:text-slate-200">{title}</span>
          <span className="text-gray-900 dark:text-white font-bold text-xs">
            {formatRupees(amount)} <span className="text-gray-400 dark:text-slate-500 font-medium">/ {isUnlimited ? 'No Limit' : formatRupees(max)}</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
          <div className={`h-2 rounded-full ${percentage >= 100 && !isUnlimited ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">
          <span>{percentage.toFixed(0)}% Utilized</span>
          <span>Remaining: {isUnlimited ? 'Unlimited' : formatRupees(remaining)}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500 dark:text-slate-400 font-medium">Summoning aggregate transactions...</p>
        </div>
      </div>);

  }

  // calculations for current month only
  const currentMonthDateLocal = new Date();
  const currentMonthPrefix = `${currentMonthDateLocal.getFullYear()}-${String(currentMonthDateLocal.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthIncomes = incomes.filter(inc => inc.date && inc.date.startsWith(currentMonthPrefix));
  const currentMonthExpensesList = expenses.filter(exp => exp.date && exp.date.startsWith(currentMonthPrefix));

  const totalIncome = currentMonthIncomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = currentMonthExpensesList.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Best estimated tax liability under Old/New
  const taxOld = taxData?.calculations?.totalTaxOld || 0;
  const taxNew = taxData?.calculations?.totalTaxNew || 0;
  const bestTax = Math.min(taxOld, taxNew);
  const bestRegime = taxData?.calculations?.recommendedRegime || 'New Regime';

  // Current Month's Budget Check
  const budgetLimit = budgetData?.budget?.limit || 0;
  const currentMonthSpent = budgetData?.totalSpent || 0;
  const budgetExceeded = budgetLimit > 0 && currentMonthSpent > budgetLimit;

  // Chart Data Preparation (Current Month Only for Pie Chart)
  const expensesByCategory = currentMonthExpensesList.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  // Analytics Calculations
  let topCategory = 'None';
  if (pieData.length > 0) {
    const sortedCategories = [...pieData].sort((a, b) => b.value - a.value);
    topCategory = sortedCategories[0].name;
  }

  let highestExpense = null;
  if (currentMonthExpensesList.length > 0) {
    const sortedExpenses = [...currentMonthExpensesList].sort((a, b) => b.amount - a.amount);
    highestExpense = sortedExpenses[0];
  }

  const currentMonthDate = new Date();
  let lastMonthYear = currentMonthDate.getFullYear();
  let lastMonthIndex = currentMonthDate.getMonth() - 1;
  if (lastMonthIndex < 0) {
    lastMonthIndex = 11;
    lastMonthYear--;
  }
  const lastMonthPrefix = `${lastMonthYear}-${String(lastMonthIndex + 1).padStart(2, '0')}`;
  
  const lastMonthExpensesList = expenses.filter(exp => exp.date && exp.date.startsWith(lastMonthPrefix));
  const lastMonthTotalExpenses = lastMonthExpensesList.reduce((sum, item) => sum + item.amount, 0);

  let expenseTrend = null; // null means no previous data
  if (lastMonthTotalExpenses > 0) {
    expenseTrend = ((totalExpenses - lastMonthTotalExpenses) / lastMonthTotalExpenses) * 100;
  }

  // --- AI Insights Logic ---
  const aiInsights = [];
  const currentMonthCategoryTotals = {};
  currentMonthExpensesList.forEach(exp => {
    currentMonthCategoryTotals[exp.category] = (currentMonthCategoryTotals[exp.category] || 0) + exp.amount;
  });

  const lastMonthCategoryTotals = {};
  lastMonthExpensesList.forEach(exp => {
    lastMonthCategoryTotals[exp.category] = (lastMonthCategoryTotals[exp.category] || 0) + exp.amount;
  });

  if (totalExpenses > 0) {
    let maxCat = '';
    let maxAmt = 0;
    for (const [cat, amt] of Object.entries(currentMonthCategoryTotals)) {
      if (amt > maxAmt) {
        maxAmt = amt;
        maxCat = cat;
      }
    }
    const percent = Math.round((maxAmt / totalExpenses) * 100);
    aiInsights.push(`${maxCat.charAt(0).toUpperCase() + maxCat.slice(1)} expenses account for ${percent}% of your total spending this month.`);
  }

  let biggestIncreaseCat = '';
  let biggestIncreasePct = 0;
  for (const [cat, amt] of Object.entries(currentMonthCategoryTotals)) {
    const lastMonthAmt = lastMonthCategoryTotals[cat] || 0;
    if (lastMonthAmt > 0) {
      const increasePct = ((amt - lastMonthAmt) / lastMonthAmt) * 100;
      if (increasePct > 5 && increasePct > biggestIncreasePct) { 
        biggestIncreasePct = increasePct;
        biggestIncreaseCat = cat;
      }
    }
  }
  
  if (biggestIncreaseCat) {
    aiInsights.push(`Your ${biggestIncreaseCat.toLowerCase()} expenses increased by ${Math.round(biggestIncreasePct)}% compared to last month.`);
  }

  if (aiInsights.length === 0) {
    if (totalExpenses === 0) {
       aiInsights.push("Log some expenses this month to unlock personalized AI insights.");
    } else {
       aiInsights.push("Your spending is consistent across categories. Great job!");
    }
  }
  // --- End AI Insights Logic ---

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];

  const processMonthlyData = () => {
    const dataMap = {};
    
    incomes.forEach(inc => {
      const date = new Date(inc.date);
      if (isNaN(date)) return;
      const month = date.toLocaleString('default', { month: 'short' });
      if (!dataMap[month]) dataMap[month] = { name: month, income: 0, expense: 0, savings: 0 };
      dataMap[month].income += inc.amount;
    });

    expenses.forEach(exp => {
      const date = new Date(exp.date);
      if (isNaN(date)) return;
      const month = date.toLocaleString('default', { month: 'short' });
      if (!dataMap[month]) dataMap[month] = { name: month, income: 0, expense: 0, savings: 0 };
      dataMap[month].expense += exp.amount;
    });

    Object.values(dataMap).forEach(item => {
      item.savings = item.income - item.expense;
    });

    return Object.values(dataMap);
  };

  const barData = processMonthlyData();

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8" id="dashboard-view">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome and DB status indicator header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-slate-700 pb-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Welcome back, {user?.name}. Check aggregate stats below.</p>
          </div>
        </div>

        {/* Budget Exceeded alert */}
        {budgetExceeded &&
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md text-orange-850 flex items-start gap-3 shadow-sm" id="budget-exceeded-dashboard-warn">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-orange-950">WARNING: Monthly Budget Limit Exceeded!</h4>
              <p className="text-sm text-orange-800 mt-1">
                You have spent <strong className="font-semibold">{formatRupees(currentMonthSpent)}</strong> this month, which exceeds your configured budget limit of <strong className="font-semibold">{formatRupees(budgetLimit)}</strong>. Limit spending immediately!
              </p>
            </div>
          </div>
        }

        {/* Summary Card Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Income */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between" id="stat-card-income">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">This Month's Income</span>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatRupees(totalIncome)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Expenses */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between" id="stat-card-expenses">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">This Month's Expenses</span>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatRupees(totalExpenses)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-200">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Balance */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between" id="stat-card-balance">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">This Month's Balance</span>
              <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatRupees(balance)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Tax */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between" id="stat-card-tax">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Estimated Tax</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatRupees(bestTax)}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold font-mono uppercase bg-gray-150 dark:bg-slate-700 inline-block px-1 py-0.5 rounded leading-none mt-1">
                {bestRegime}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-200">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Expense Analytics */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-md text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-2 flex items-center gap-2">
            Expense Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Top Spending Category</span>
              <p className="text-xl font-bold text-purple-600 capitalize">{topCategory}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Highest Expense</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {highestExpense ? `${highestExpense.title} (${formatRupees(highestExpense.amount)})` : 'None'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Monthly Trend</span>
              {expenseTrend !== null ? (
                <p className={`text-xl font-bold ${expenseTrend > 0 ? 'text-red-550' : 'text-green-600'}`}>
                  {expenseTrend > 0 ? '+' : ''}{expenseTrend.toFixed(1)}% vs Last Month
                </p>
              ) : (
                <p className="text-xl font-bold text-gray-400 dark:text-slate-500">
                  N/A <span className="text-sm font-normal">(No prior data)</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* AI Expense Insights */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6 rounded-lg border border-indigo-100 dark:border-indigo-800/50 shadow-sm space-y-4">
          <h3 className="font-bold text-md text-indigo-900 dark:text-indigo-200 border-b border-indigo-200/50 dark:border-indigo-800/50 pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            AI Expense Insights
          </h3>
          <ul className="space-y-3">
            {aiInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-indigo-800 dark:text-indigo-200">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 shrink-0"></span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-md text-gray-900 dark:text-white mb-4">Current Month's Expenses</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupees(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-md text-gray-900 dark:text-white mb-4">Monthly Income vs Expenses</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatRupees(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-md text-gray-900 dark:text-white mb-4">Savings Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatRupees(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={3} name="Savings" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions Split Screens (Expenses & Income) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Expenses Container */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-md text-gray-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-red-500" />
                Recent Expenses logged
              </h3>
              <Link to="/expenses" className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
                Manage
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {expenses.length === 0 ?
            <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                No logged expenses found.{' '}
                <Link to="/expenses" className="text-blue-600 underline font-semibold">
                  Add one
                </Link>
              </div> :

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700/50 text-gray-500 dark:text-slate-400 font-semibold bg-gray-50 dark:bg-slate-900">
                      <th className="py-2 px-3">Title</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 5).map((exp) =>
                  <tr key={exp._id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 transition">
                        <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{exp.title}</td>
                        <td className="py-2.5 px-3 text-gray-600 dark:text-slate-300">
                          <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100 px-2 py-0.5 rounded-full capitalize">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-red-650">{formatRupees(exp.amount)}</td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }
          </div>

          {/* Recent Incomes Container */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-md text-gray-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Recent Income logged
              </h3>
              <Link to="/income" className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
                Manage
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {incomes.length === 0 ?
            <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                No logged income found.{' '}
                <Link to="/income" className="text-blue-600 underline font-semibold">
                  Add user salary
                </Link>
              </div> :

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700/50 text-gray-500 dark:text-slate-400 font-semibold bg-gray-50 dark:bg-slate-900">
                      <th className="py-2 px-3">Source</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomes.slice(0, 5).map((inc) =>
                  <tr key={inc._id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 transition">
                        <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{inc.source}</td>
                        <td className="py-2.5 px-3 text-gray-600 dark:text-slate-300 text-xs flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                          {inc.date}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-green-650">{formatRupees(inc.amount)}</td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }
          </div>

        </div>

        {/* Tax Deductions Utilization Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-md text-gray-900 dark:text-white flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-purple-500" />
              Tax Deductions Utilization (Old Regime)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700/50">
            <DeductionProgress 
              title="80C (LIC, EPF, PPF)" 
              amount={(taxData?.profile?.deductions80C || 0) + (taxData?.profile?.epf || 0) + (taxData?.profile?.elss || 0)} 
              max={150000} 
            />
            <DeductionProgress 
              title="80D (Health Ins)" 
              amount={taxData?.profile?.deductions80D || 0} 
              max={25000} 
            />
            <DeductionProgress 
              title="NPS 80CCD(1B)" 
              amount={taxData?.profile?.nps || 0} 
              max={50000} 
            />
            <DeductionProgress 
              title="Home Loan 24(b)" 
              amount={taxData?.profile?.homeLoan || 0} 
              max={200000} 
            />
            <DeductionProgress 
              title="Education Loan 80E" 
              amount={taxData?.profile?.educationLoan || 0} 
              max={null} 
            />
          </div>
        </div>

        {/* Budget management CTA Bar */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="space-y-1 mb-3 md:mb-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Create Monthly Budgets to Prevent Overspending</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">Configure monthly limits and view status logs to stay informed about active balance thresholds.</p>
          </div>
          <Link
            to="/budgets"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-md transition shadow-sm inline-flex items-center gap-1">
            
            <PlusCircle className="w-4 h-4" />
            Set Budget Limit
          </Link>
        </div>

      </div>
    </div>);

};

export default Dashboard;
