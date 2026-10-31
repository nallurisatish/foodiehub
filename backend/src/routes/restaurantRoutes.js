import express from 'express';
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurantController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Admin-only management routes
router.post('/', authenticate, authorize('admin'), createRestaurant);
router.put('/:id', authenticate, authorize('admin'), updateRestaurant);
router.delete('/:id', authenticate, authorize('admin'), deleteRestaurant);

export default router;
