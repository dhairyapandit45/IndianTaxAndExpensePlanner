import mongoose from 'mongoose';
import { MernModel } from './dbAdapter.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const UserMongoose = mongoose.models.User || mongoose.model('User', UserSchema);
const User = new MernModel(UserMongoose, 'users');
export default User;
