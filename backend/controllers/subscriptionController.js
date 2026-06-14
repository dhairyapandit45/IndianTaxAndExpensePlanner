import Subscription from '../models/Subscription.js';
import { processSubscriptions } from '../utils/subscriptionProcessor.js';

// @desc    Get all subscriptions for current user
// @route   GET /api/subscriptions
export const getSubscriptions = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const userSubscriptions = await Subscription.find({ userId });
    res.json(userSubscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error fetching subscriptions.' });
  }
};

// @desc    Add a subscription
// @route   POST /api/subscriptions
export const createSubscription = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  const { title, amount, category, frequency, nextDueDate, isActive } = req.body;

  if (!title || !amount || !category || !frequency || !nextDueDate) {
    res.status(400).json({ message: 'Title, amount, category, frequency, and nextDueDate are required.' });
    return;
  }

  try {
    const newSubscription = await Subscription.create({
      userId,
      title,
      amount: Number(amount),
      category,
      frequency,
      nextDueDate,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(newSubscription);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error creating subscription.' });
  }
};

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
export const updateSubscription = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found.' });
      return;
    }

    if (subscription.userId !== userId) {
      res.status(401).json({ message: 'User not authorized to update this subscription.' });
      return;
    }

    const { title, amount, category, frequency, nextDueDate, isActive } = req.body;

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      {
        title: title || subscription.title,
        amount: amount !== undefined ? Number(amount) : subscription.amount,
        category: category || subscription.category,
        frequency: frequency || subscription.frequency,
        nextDueDate: nextDueDate || subscription.nextDueDate,
        isActive: isActive !== undefined ? isActive : subscription.isActive
      },
      { new: true }
    );

    res.json(updatedSubscription);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error updating subscription.' });
  }
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
export const deleteSubscription = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found.' });
      return;
    }

    if (subscription.userId !== userId) {
      res.status(401).json({ message: 'User not authorized to delete this subscription.' });
      return;
    }

    await Subscription.findByIdAndDelete(id);
    res.json({ message: 'Subscription deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error deleting subscription.' });
  }
};

// @desc    Process due subscriptions and create expenses
// @route   GET /api/subscriptions/process
export const processSubscriptionsHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const processedCount = await processSubscriptions(userId);
    res.json({ message: `Processed ${processedCount} subscriptions.` });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error processing subscriptions.' });
  }
};
