import express from 'express';
import { 
  getSubscriptions, 
  createSubscription, 
  updateSubscription, 
  deleteSubscription,
  processSubscriptionsHandler
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/process', protect, processSubscriptionsHandler);

router.route('/')
  .get(protect, getSubscriptions)
  .post(protect, createSubscription);

router.route('/:id')
  .put(protect, updateSubscription)
  .delete(protect, deleteSubscription);

export default router;
