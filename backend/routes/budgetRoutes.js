import express from 'express';
import { getBudget, setBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').
post(protect, setBudget);

router.route('/:month?').
get(protect, getBudget);

export default router;