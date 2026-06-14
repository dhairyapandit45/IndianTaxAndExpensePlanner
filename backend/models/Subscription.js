import mongoose from 'mongoose';
import { MernModel } from './dbAdapter.js';

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  frequency: { type: String, required: true },
  nextDueDate: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const SubscriptionMongoose = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
const Subscription = new MernModel(SubscriptionMongoose, 'subscriptions');
export default Subscription;
