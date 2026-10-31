import express from 'express';
import {
  getCart,
  addItem,
  updateItemQuantity,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:itemId', updateItemQuantity);
router.delete('/', clearCart);

export default router;
