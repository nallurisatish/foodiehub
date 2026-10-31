import express from 'express';
import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from '../controllers/foodController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', getFoods);
router.get('/:id', getFoodById);

// Admin-only food routes
router.post('/', authenticate, authorize('admin'), createFood);
router.put('/:id', authenticate, authorize('admin'), updateFood);
router.delete('/:id', authenticate, authorize('admin'), deleteFood);

export default router;
