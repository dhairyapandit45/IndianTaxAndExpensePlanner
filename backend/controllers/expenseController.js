

import Expense from '../models/Expense.js';

// @desc    Get all expenses for current user
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const userExpenses = await Expense.find({ userId });
    // Sort by date descending
    userExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(userExpenses);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error fetching expenses.' });
  }
};

// @desc    Add an expense
// @route   POST /api/expenses
export const createExpense = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  const { title, amount, category, date, notes } = req.body;

  if (!title || !amount || !category || !date) {
    res.status(400).json({ message: 'Title, amount, category and date are required.' });
    return;
  }

  try {
    const newExpense = await Expense.create({
      userId,
      title,
      amount: Number(amount),
      category,
      date,
      notes: notes || ''
    });

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error creating expense.' });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const expense = await Expense.findById(id);

    if (!expense) {
      res.status(404).json({ message: 'Expense not found.' });
      return;
    }

    if (expense.userId !== userId) {
      res.status(401).json({ message: 'User not authorized to update this expense.' });
      return;
    }

    const { title, amount, category, date, notes } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        title: title || expense.title,
        amount: amount !== undefined ? Number(amount) : expense.amount,
        category: category || expense.category,
        date: date || expense.date,
        notes: notes !== undefined ? notes : expense.notes
      },
      { new: true }
    );

    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error updating expense.' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const expense = await Expense.findById(id);

    if (!expense) {
      res.status(404).json({ message: 'Expense not found.' });
      return;
    }

    if (expense.userId !== userId) {
      res.status(410).json({ message: 'User not authorized to delete this expense.' });
      return;
    }

    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error deleting expense.' });
  }
};