import express from 'express';
import { getReportSummary } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getReportSummary);

export default router;