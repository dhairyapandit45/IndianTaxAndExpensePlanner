import express from 'express';
import path from 'path';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Import API routes
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import taxRoutes from './routes/taxRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB immediately (Mongoose buffers queries until connected)
connectDB();

// Middlewares to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Allow frontend to talk to backend

// API Route mountings
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Simple Health / Check system
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Listen on the assigned port (Render provides this automatically in production)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Tax & Expense Manager API starting on http://0.0.0.0:${PORT}`);
});