import mongoose from 'mongoose';
import { MernModel } from './dbAdapter.js';

const BudgetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  month: { type: String, required: true },
  limit: { type: Number, required: true }
}, { timestamps: true });

export const BudgetMongoose = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
const Budget = new MernModel(BudgetMongoose, 'budgets');
export default Budget;
