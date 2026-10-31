import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Restaurant } from '../models/Restaurant.js';
import { Food } from '../models/Food.js';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';

export const isDbLive = () => mongoose.connection.readyState === 1;

// In-memory persistent caches for fallback resilience
export const memoryStore = {
  users: [],
  restaurants: [],
  foods: [],
  orders: [],
  carts: [],
  coupons: [],
  paymentEvents: [],
};
