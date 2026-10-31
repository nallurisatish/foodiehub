import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Food } from '../models/Food.js';
import { Restaurant } from '../models/Restaurant.js';
import { Coupon } from '../models/Coupon.js';
import { Cart } from '../models/Cart.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';
import { getRazorpayInstance } from '../config/razorpay.js';

const generateOrderNumber = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `FH-${random}`;
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      restaurantId,
      items,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one food item and a valid restaurant.',
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address (street, city, pincode) is required.',
      });
    }

    if (!['Razorpay', 'Cash on Delivery'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Choose Razorpay or Cash on Delivery.',
      });
    }

    // 1. Fetch Restaurant
    let restaurant;
    if (isDbLive()) {
      restaurant = await Restaurant.findById(restaurantId);
    } else {
      restaurant = memoryStore.restaurants.find(
        (r) => r._id.toString() === restaurantId.toString()
      );
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.',
      });
    }

    // 2. Fetch fresh prices & verify food items from database
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const foodId = item.foodId || item._id;
      let food;
      if (isDbLive()) {
        food = await Food.findById(foodId);
      } else {
        food = memoryStore.foods.find(
          (f) => f._id.toString() === foodId.toString()
        );
      }

      if (!food) {
        return res.status(400).json({
          success: false,
          message: `Food item '${item.name || foodId}' is no longer available.`,
        });
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `'${food.name}' is currently out of stock.`,
        });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = food.price * qty;
      subtotal += lineTotal;

      verifiedItems.push({
        foodId: food._id,
        name: food.name,
        price: food.price, // Snapshot current price
        image: food.image,
        isVegetarian: food.isVegetarian,
        quantity: qty,
        lineTotal,
      });
    }

    // 3. Server-side coupon verification
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const normalizedCode = couponCode.toUpperCase().trim();
      let coupon;
      if (isDbLive()) {
        coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });
      } else {
        coupon = memoryStore.coupons.find(
          (c) => c.code === normalizedCode && c.isActive
        );
      }

      if (coupon && new Date(coupon.expiryDate) >= new Date()) {
        if (subtotal >= coupon.minimumOrderValue) {
          if (coupon.discountType === 'percentage') {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
              discount = coupon.maximumDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          if (discount > subtotal) discount = subtotal;
          appliedCoupon = coupon.code;
        }
      }
    }

    // 4. Calculate Delivery Fee and 5% GST
    const deliveryFee = Number(restaurant.deliveryFee) || 40;
    const tax = Math.round((subtotal - discount) * 0.05); // 5% GST
    const totalAmount = Math.max(0, subtotal + deliveryFee + tax - discount);

    const orderNumber = generateOrderNumber();

    const isCOD = paymentMethod === 'Cash on Delivery';
    const initialPaymentStatus = 'Pending';
    const initialOrderStatus = isCOD ? 'Confirmed' : 'Pending';

    const deliveryCoordinates = req.body.deliveryCoordinates || {
      lat: 16.5074,
      lng: 80.6466,
    };
    const restaurantCoordinates = req.body.restaurantCoordinates || {
      lat: restaurant.coordinates?.lat || 16.5085,
      lng: restaurant.coordinates?.lng || 80.6480,
    };

    const RIDER_NAMES = ['Vikram Singh', 'Ramesh Kumar', 'Rahul Sharma', 'Ankit Verma', 'Suresh Patel'];
    const RIDER_VEHICLES = ['Honda Activa 6G • KA 05 EV 8891', 'TVS Jupiter • AP 16 BK 4421', 'Hero Splendor • KA 01 TR 9920', 'Bajaj Pulsar • DL 04 AX 1982'];
    const riderIdx = Math.floor(Math.random() * RIDER_NAMES.length);
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();

    const riderDetails = {
      name: RIDER_NAMES[riderIdx],
      phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
      vehicleNumber: RIDER_VEHICLES[riderIdx],
      rating: 4.85,
      deliveriesCount: 1240 + Math.floor(Math.random() * 300),
      currentLat: restaurantCoordinates.lat,
      currentLng: restaurantCoordinates.lng,
      hasArrived: false,
      arrivedAt: null,
    };

    const orderPayload = {
      orderNumber,
      userId,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      restaurantAddress: {
        doorNo: restaurant.address?.doorNo || '',
        street: restaurant.address?.street || '',
        locality: restaurant.address?.locality || '',
        landmark: restaurant.address?.landmark || '',
        city: restaurant.address?.city || 'Bengaluru',
        pincode: restaurant.address?.pincode || '',
        googleMapsUrl: restaurant.googleMapsUrl || '',
        contactPhone: restaurant.contactPhone || '',
      },
      deliveryCoordinates,
      restaurantCoordinates,
      deliveryPin,
      riderDetails,
      items: verifiedItems,
      deliveryAddress: {
        street: deliveryAddress.street,
        landmark: deliveryAddress.landmark || '',
        city: deliveryAddress.city,
        state: deliveryAddress.state || '',
        pincode: deliveryAddress.pincode,
        phone: deliveryAddress.phone || req.user.phone || '',
        name: deliveryAddress.name || req.user.name,
      },
      deliveryInstructions: deliveryInstructions || '',
      subtotal,
      deliveryFee,
      tax,
      discount,
      couponCode: appliedCoupon,
      totalAmount,
      paymentMethod,
      paymentProvider: isCOD ? 'Cash' : 'Razorpay',
      paymentStatus: initialPaymentStatus,
      orderStatus: initialOrderStatus,
      statusHistory: [
        {
          status: initialOrderStatus,
          timestamp: new Date(),
          comment: isCOD
            ? 'Order placed with Cash on Delivery.'
            : 'Order created awaiting online payment.',
        },
      ],
      estimatedDeliveryTime: restaurant.estimatedDeliveryTime || '35 mins',
    };

    // If Razorpay, generate razorpay gateway order
    let razorpayOrderData = null;
    if (!isCOD) {
      const rzp = getRazorpayInstance();
      if (rzp) {
        try {
          const rzpOrder = await rzp.orders.create({
            amount: totalAmount * 100, // paise
            currency: 'INR',
            receipt: orderNumber,
            notes: {
              userId: userId.toString(),
              orderNumber,
            },
          });
          orderPayload.gatewayOrderId = rzpOrder.id;
          razorpayOrderData = {
            id: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_FoodieHubDev123',
          };
        } catch (rzpErr) {
          console.warn('⚠️ Razorpay order creation failed, fallback to mock order ID:', rzpErr.message);
          orderPayload.gatewayOrderId = `order_mock_${Date.now()}`;
          razorpayOrderData = {
            id: orderPayload.gatewayOrderId,
            amount: totalAmount * 100,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_FoodieHubDev123',
          };
        }
      } else {
        orderPayload.gatewayOrderId = `order_mock_${Date.now()}`;
        razorpayOrderData = {
          id: orderPayload.gatewayOrderId,
          amount: totalAmount * 100,
          currency: 'INR',
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_FoodieHubDev123',
        };
      }
    }

    let savedOrder;
    if (isDbLive()) {
      savedOrder = await Order.create(orderPayload);
      // Clear user's cart on order placement
      await Cart.findOneAndUpdate({ userId }, { items: [], restaurantId: null });
    } else {
      savedOrder = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...orderPayload,
        createdAt: new Date(),
      };
      memoryStore.orders.push(savedOrder);
      // Clear memory cart
      const cart = memoryStore.carts.find(
        (c) => c.userId.toString() === userId.toString()
      );
      if (cart) {
        cart.items = [];
        cart.restaurantId = null;
      }
    }

    return res.status(201).json({
      success: true,
      message: isCOD
        ? 'Order placed successfully! Sit back and relax.'
        : 'Order created. Complete payment to confirm.',
      order: savedOrder,
      razorpayOrder: razorpayOrderData,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (isDbLive()) {
      const orders = await Order.find({ userId })
        .populate('restaurantId', 'name image address')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } else {
      const orders = memoryStore.orders
        .filter((o) => o.userId.toString() === userId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const role = req.user.role;

    let order;
    if (isDbLive()) {
      order = await Order.findById(id).populate('restaurantId');
    } else {
      order = memoryStore.orders.find(
        (o) => o._id.toString() === id.toString() || o.orderNumber === id
      );
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Role check: Customer can only view their own orders
    if (role !== 'admin' && order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    let order;
    if (isDbLive()) {
      order = await Order.findById(id);
    } else {
      order = memoryStore.orders.find((o) => o._id.toString() === id.toString());
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders.',
      });
    }

    // Cancellation policy: Only Pending or Confirmed orders can be cancelled
    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Orders that are '${order.orderStatus}' cannot be cancelled as kitchen preparation or delivery has commenced.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      comment: reason || 'Order cancelled.',
    });

    if (order.paymentStatus === 'Paid') {
      order.refundStatus = 'Refund Initiated (Demo Test Mode)';
    }

    if (isDbLive()) {
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Order has been cancelled successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRiderLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, hasArrived, status } = req.body;

    let order;
    if (isDbLive()) {
      order = await Order.findById(id);
    } else {
      order = memoryStore.orders.find((o) => o._id.toString() === id.toString());
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!order.riderDetails) {
      order.riderDetails = {
        name: 'Vikram Singh',
        phone: '+91 98765 43210',
        vehicleNumber: 'Honda Activa 6G • KA 05 EV 8891',
        rating: 4.85,
        deliveriesCount: 1240,
        currentLat: lat || order.restaurantCoordinates?.lat || 16.5085,
        currentLng: lng || order.restaurantCoordinates?.lng || 80.6480,
        hasArrived: false,
      };
    }

    if (lat && lng) {
      order.riderDetails.currentLat = Number(lat);
      order.riderDetails.currentLng = Number(lng);
    }

    if (hasArrived) {
      order.riderDetails.hasArrived = true;
      order.riderDetails.arrivedAt = new Date();
      if (!order.statusHistory.some((s) => s.comment?.includes('arrived at your doorstep'))) {
        order.statusHistory.push({
          status: order.orderStatus === 'Delivered' ? 'Delivered' : 'Out for Delivery',
          timestamp: new Date(),
          comment: `🛵 Delivery partner ${order.riderDetails.name} has arrived at your doorstep! Please share PIN: ${order.deliveryPin || '4821'}.`,
        });
      }
    }

    if (status && ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(status)) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        comment: `Order transitioned to ${status}.`,
      });
    }

    if (isDbLive()) {
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: hasArrived ? 'Rider arrival recorded successfully!' : 'Rider location updated.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

