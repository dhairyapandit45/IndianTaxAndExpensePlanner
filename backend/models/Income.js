import mongoose from 'mongoose';
import { MernModel } from './dbAdapter.js';

const IncomeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  source: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

export const IncomeMongoose = mongoose.models.Income || mongoose.model('Income', IncomeSchema);
const Income = new MernModel(IncomeMongoose, 'incomes');
export default Income;
