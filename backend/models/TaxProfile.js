import mongoose from 'mongoose';
import { MernModel } from './dbAdapter.js';

const TaxProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  salaryIncome: { type: Number, default: 0 },
  businessIncome: { type: Number, default: 0 },
  otherIncome: { type: Number, default: 0 },
  deductions80C: { type: Number, default: 0 },
  deductions80D: { type: Number, default: 0 },
  educationLoan: { type: Number, default: 0 },
  epf: { type: Number, default: 0 },
  elss: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  homeLoan: { type: Number, default: 0 },
  nps: { type: Number, default: 0 }
}, { timestamps: true });

export const TaxProfileMongoose = mongoose.models.TaxProfile || mongoose.model('TaxProfile', TaxProfileSchema);
const TaxProfile = new MernModel(TaxProfileMongoose, 'taxProfiles');
export default TaxProfile;
