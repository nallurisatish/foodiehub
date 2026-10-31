import express from 'express';
import {
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Verify payment requires authentication
router.post('/razorpay/verify', authenticate, verifyPayment);
router.get('/:orderId/status', authenticate, getPaymentStatus);

// Webhook endpoint (Signature verified using raw body, exempt from user auth)
router.post('/razorpay/webhook', handleWebhook);

export default router;
