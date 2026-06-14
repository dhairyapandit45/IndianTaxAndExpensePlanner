import express from 'express';
import { getTaxProfile, updateTaxProfile } from '../controllers/taxController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').
get(protect, getTaxProfile).
post(protect, updateTaxProfile);

export default router;