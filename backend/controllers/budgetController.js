

import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

// @desc    Get current budget details for the specified or current month
// @route   GET /api/budgets/:month?
export const getBudget = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  // Use passed month (YYYY-MM) or default to current month
  let month = req.params.month;
  if (!month) {
    const today = new Date();
    const yearStr = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    month = `${yearStr}-${monthStr}`;
  }

  try {
    let budget = await Budget.findOne({ userId, month });

    // Calculate total expenses for this month to check limits
    const allExpenses = await Expense.find({ userId });
    const monthExpenses = allExpenses.filter((exp) => exp.date.startsWith(month));
    const totalSpent = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Return current budget and spent calculation
    res.json({
      budget: budget || { userId, month, limit: 0, _id: '' },
      totalSpent,
      exceeded: budget && budget.limit > 0 ? totalSpent > budget.limit : false,
      month
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error fetching budget.' });
  }
};

// @desc    Set or update a budget for a month
// @route   POST /api/budgets
export const setBudget = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  const { month, limit } = req.body;

  if (!month || limit === undefined) {
    res.status(400).json({ message: 'Month (YYYY-MM) and budget limit are required.' });
    return;
  }

  try {
    let existingBudget = await Budget.findOne({ userId, month });

    let updatedBudget;
    if (existingBudget && existingBudget._id) {
      updatedBudget = await Budget.findByIdAndUpdate(
        existingBudget._id,
        { limit: Number(limit) },
        { new: true }
      );
    } else {
      updatedBudget = await Budget.create({
        userId,
        month,
        limit: Number(limit)
      });
    }

    res.json(updatedBudget);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error setting budget.' });
  }
};