import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
  name: { type: String, required: true },
  price: { type: Number, required: true }, // price snapshot
  image: { type: String, default: '' },
  isVegetarian: { type: Boolean, default: false },
  quantity: { type: Number, required: true, min: 1 },
  lineTotal: { type: Number, required: true },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  comment: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    restaurantName: { type: String, default: '' },
    restaurantAddress: {
      doorNo: { type: String, default: '' },
      street: { type: String, default: '' },
      locality: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, default: 'Bengaluru' },
      pincode: { type: String, default: '' },
      googleMapsUrl: { type: String, default: '' },
      contactPhone: { type: String, default: '' },
    },
    items: [orderItemSchema],
    deliveryCoordinates: {
      lat: { type: Number, default: 16.5074 },
      lng: { type: Number, default: 80.6466 },
    },
    restaurantCoordinates: {
      lat: { type: Number, default: 16.5085 },
      lng: { type: Number, default: 80.6480 },
    },
    deliveryPin: { type: String, default: '4821' },
    riderDetails: {
      name: { type: String, default: 'Vikram Singh' },
      phone: { type: String, default: '+91 98765 43210' },
      vehicleNumber: { type: String, default: 'Honda Activa 6G • KA 05 EV 8891' },
      rating: { type: Number, default: 4.8 },
      deliveriesCount: { type: Number, default: 1240 },
      currentLat: { type: Number, default: 16.5085 },
      currentLng: { type: Number, default: 80.6480 },
      hasArrived: { type: Boolean, default: false },
      arrivedAt: { type: Date, default: null },
    },
    deliveryAddress: {
      street: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
      name: { type: String, required: true },
    },
    deliveryInstructions: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'Cash on Delivery'],
      required: true,
    },
    paymentProvider: { type: String, default: 'Razorpay' },
    paymentStatus: {
      type: String,
      enum: [
        'Pending',
        'Processing',
        'Paid',
        'Failed',
        'Cancelled',
        'Refund Pending',
        'Refunded',
      ],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Preparing',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Pending',
    },
    gatewayOrderId: { type: String, default: null },
    gatewayPaymentId: { type: String, default: null },
    paymentSignatureVerified: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    refundStatus: { type: String, default: null },
    statusHistory: [statusHistorySchema],
    cancellationReason: { type: String, default: null },
    estimatedDeliveryTime: { type: String, default: '35 mins' },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

export const Order = mongoose.model('Order', orderSchema);
