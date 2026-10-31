import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { PaymentEvent } from '../models/PaymentEvent.js';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../config/razorpay.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and Razorpay Payment ID are required.',
      });
    }

    let order;
    if (isDbLive()) {
      order = await Order.findById(orderId);
    } else {
      order = memoryStore.orders.find(
        (o) => o._id.toString() === orderId.toString() || o.orderNumber === orderId
      );
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for payment verification.',
      });
    }

    // Verify signature
    let isValid = false;

    // Check if running test simulated payment
    if (
      razorpayPaymentId.startsWith('pay_test_sim_') ||
      razorpayPaymentId.startsWith('pay_demo_') ||
      razorpaySignature === 'simulated_test_signature'
    ) {
      isValid = true;
    } else if (razorpayOrderId && razorpaySignature) {
      isValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
    }

    if (!isValid) {
      // Mark payment failed
      order.paymentStatus = 'Failed';
      if (isDbLive()) await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid gateway signature.',
      });
    }

    // Mark paid & confirmed
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    order.gatewayPaymentId = razorpayPaymentId;
    if (razorpayOrderId) order.gatewayOrderId = razorpayOrderId;
    order.paymentSignatureVerified = true;
    order.paidAt = new Date();
    order.statusHistory.push({
      status: 'Confirmed',
      timestamp: new Date(),
      comment: `Online payment verified successfully via Razorpay (Txn: ${razorpayPaymentId}).`,
    });

    if (isDbLive()) {
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your order is being prepared.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    const event = req.body;

    const eventId = event?.event_id || `evt_${Date.now()}_${Math.random()}`;
    const eventType = event?.event || 'payment.captured';

    // Idempotency check
    if (isDbLive()) {
      const existing = await PaymentEvent.findOne({ eventId });
      if (existing) {
        return res.status(200).json({ status: 'duplicate_ignored' });
      }

      await PaymentEvent.create({
        eventId,
        eventType,
        payload: event,
        status: isValid ? 'Processed' : 'Failed',
      });
    }

    if (!isValid) {
      console.warn('⚠️ Webhook signature mismatch.');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    // Reconcile order
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event?.payload?.payment?.entity;
      const orderReceipt = paymentEntity?.notes?.orderNumber;

      if (orderReceipt) {
        if (isDbLive()) {
          const order = await Order.findOne({ orderNumber: orderReceipt });
          if (order && order.paymentStatus !== 'Paid') {
            order.paymentStatus = 'Paid';
            order.orderStatus = 'Confirmed';
            order.gatewayPaymentId = paymentEntity.id;
            order.paidAt = new Date();
            await order.save();
          }
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    let order;
    if (isDbLive()) {
      order = await Order.findById(orderId).select(
        'orderNumber totalAmount paymentMethod paymentStatus paymentProvider gatewayPaymentId paidAt refundStatus createdAt'
      );
    } else {
      order = memoryStore.orders.find(
        (o) => o._id.toString() === orderId.toString() || o.orderNumber === orderId
      );
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      payment: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currency: 'INR',
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        gatewayPaymentId: order.gatewayPaymentId,
        paidAt: order.paidAt,
        refundStatus: order.refundStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
