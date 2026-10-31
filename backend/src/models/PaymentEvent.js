import mongoose from 'mongoose';

const paymentEventSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'Razorpay' },
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    orderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    payload: { type: mongoose.Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['Received', 'Processed', 'Failed', 'Duplicate'],
      default: 'Received',
    },
  },
  { timestamps: true }
);

export const PaymentEvent = mongoose.model('PaymentEvent', paymentEventSchema);
