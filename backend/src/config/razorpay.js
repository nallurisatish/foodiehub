import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_FoodieHubDev123';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'FoodieHubDevSecretKey456';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  console.warn('⚠️ Razorpay initialization warning:', err.message);
}

export const getRazorpayInstance = () => razorpayInstance;

/**
 * Verify Razorpay payment signature
 * signature = hmac_sha256(order_id + "|" + payment_id, secret)
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'FoodieHubDevSecretKey456';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Verify Razorpay Webhook signature
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'FoodieHubWebhookSecret789';
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};
