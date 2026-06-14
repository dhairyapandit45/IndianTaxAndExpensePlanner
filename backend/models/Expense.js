import mongoose from 'mongoose';
import { MernModel } from './dbAdapter.js';

const ExpenseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

export const ExpenseMongoose = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const Expense = new MernModel(ExpenseMongoose, 'expenses');
export default Expense;
