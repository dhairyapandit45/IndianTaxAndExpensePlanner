import Subscription from '../models/Subscription.js';
import Expense from '../models/Expense.js';

export const processSubscriptions = async (userId) => {
  const subscriptions = await Subscription.find({ userId });
  // Filter manually as simple mock find doesn't support deep queries easily
  const activeSubscriptions = subscriptions.filter(s => s.isActive);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let processedCount = 0;

  for (const sub of activeSubscriptions) {
    let nextDate = new Date(sub.nextDueDate);
    let updated = false;

    // To prevent infinite loops with invalid dates
    let iterations = 0;
    while (nextDate <= today && iterations < 100) {
      iterations++;
      
      // Create expense for this due date
      await Expense.create({
        userId: sub.userId,
        title: sub.title,
        amount: sub.amount,
        category: sub.category,
        date: nextDate.toISOString().split('T')[0], // format as YYYY-MM-DD
        notes: `Recurring transaction: ${sub.title}`
      });

      processedCount++;

      // Increment nextDueDate based on frequency
      const freq = sub.frequency ? sub.frequency.toLowerCase() : 'monthly';
      if (freq === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (freq === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else if (freq === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
      } else {
        // Default to monthly
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      updated = true;
    }

    if (updated) {
      // Update subscription with new nextDueDate
      await Subscription.findByIdAndUpdate(sub._id, {
        nextDueDate: nextDate.toISOString().split('T')[0]
      });
    }
  }

  return processedCount;
};
