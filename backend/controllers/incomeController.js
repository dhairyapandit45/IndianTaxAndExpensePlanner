import Income from '../models/Income.js';

// @desc    Get all incomes for current user
// @route   GET /api/income
export const getIncomes = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const userIncomes = await Income.find({ userId });
    // Sort by date descending
    userIncomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(userIncomes);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error fetching incomes.' });
  }
};

// @desc    Add an income
// @route   POST /api/income
export const createIncome = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  const { source, amount, date } = req.body;

  if (!source || !amount || !date) {
    res.status(400).json({ message: 'Source, amount and date are required.' });
    return;
  }

  try {
    const newIncome = await Income.create({
      userId,
      source,
      amount: Number(amount),
      date
    });

    res.status(201).json(newIncome);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error creating income.' });
  }
};

// @desc    Update an income
// @route   PUT /api/income/:id
export const updateIncome = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const income = await Income.findById(id);

    if (!income) {
      res.status(404).json({ message: 'Income record not found.' });
      return;
    }

    if (income.userId !== userId) {
      res.status(401).json({ message: 'User not authorized to update this income.' });
      return;
    }

    const { source, amount, date } = req.body;

    const updatedIncome = await Income.findByIdAndUpdate(
      id,
      {
        source: source || income.source,
        amount: amount !== undefined ? Number(amount) : income.amount,
        date: date || income.date
      },
      { new: true }
    );

    res.json(updatedIncome);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error updating income.' });
  }
};

// @desc    Delete an income
// @route   DELETE /api/income/:id
export const deleteIncome = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const income = await Income.findById(id);

    if (!income) {
      res.status(404).json({ message: 'Income record not found.' });
      return;
    }

    if (income.userId !== userId) {
      res.status(401).json({ message: 'User not authorized to delete this income.' });
      return;
    }

    await Income.findByIdAndDelete(id);
    res.json({ message: 'Income deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error deleting income.' });
  }
};