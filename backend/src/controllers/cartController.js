import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Food } from '../models/Food.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (isDbLive()) {
      let cart = await Cart.findOne({ userId }).populate('items.foodId');
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }
      return res.status(200).json({
        success: true,
        cart,
      });
    } else {
      let cart = memoryStore.carts.find(
        (c) => c.userId.toString() === userId.toString()
      );
      if (!cart) {
        cart = {
          _id: new mongoose.Types.ObjectId().toString(),
          userId,
          restaurantId: null,
          items: [],
          updatedAt: new Date(),
        };
        memoryStore.carts.push(cart);
      }
      return res.status(200).json({
        success: true,
        cart,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { foodId, quantity = 1, forceReplace = false } = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: 'Food ID is required.',
      });
    }

    // Fetch food item
    let food;
    if (isDbLive()) {
      food = await Food.findById(foodId);
    } else {
      food = memoryStore.foods.find(
        (f) => f._id.toString() === foodId.toString()
      );
    }

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found.',
      });
    }

    if (!food.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this food item is currently out of stock.',
      });
    }

    if (isDbLive()) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [], restaurantId: food.restaurantId });
      }

      // Check single restaurant rule
      if (
        cart.restaurantId &&
        cart.items.length > 0 &&
        cart.restaurantId.toString() !== food.restaurantId.toString()
      ) {
        if (!forceReplace) {
          return res.status(409).json({
            success: false,
            conflict: true,
            replaceRequired: true,
            message:
              'Your cart contains dishes from another restaurant. Would you like to reset your cart to add items from this restaurant?',
          });
        }
        // Force reset
        cart.items = [];
        cart.restaurantId = food.restaurantId;
      }

      cart.restaurantId = food.restaurantId;

      const existingIndex = cart.items.findIndex(
        (item) => item.foodId.toString() === foodId.toString()
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += Number(quantity);
      } else {
        cart.items.push({
          foodId: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          isVegetarian: food.isVegetarian,
          quantity: Number(quantity),
        });
      }

      await cart.save();
      await cart.populate('items.foodId');

      return res.status(200).json({
        success: true,
        message: 'Item added to cart.',
        cart,
      });
    } else {
      let cart = memoryStore.carts.find(
        (c) => c.userId.toString() === userId.toString()
      );
      if (!cart) {
        cart = {
          _id: new mongoose.Types.ObjectId().toString(),
          userId,
          restaurantId: food.restaurantId,
          items: [],
        };
        memoryStore.carts.push(cart);
      }

      if (
        cart.restaurantId &&
        cart.items.length > 0 &&
        cart.restaurantId.toString() !== food.restaurantId.toString()
      ) {
        if (!forceReplace) {
          return res.status(409).json({
            success: false,
            conflict: true,
            replaceRequired: true,
            message:
              'Your cart contains dishes from another restaurant. Would you like to reset your cart to add items from this restaurant?',
          });
        }
        cart.items = [];
        cart.restaurantId = food.restaurantId;
      }

      cart.restaurantId = food.restaurantId;
      const existing = cart.items.find(
        (i) => i.foodId.toString() === foodId.toString()
      );
      if (existing) {
        existing.quantity += Number(quantity);
      } else {
        cart.items.push({
          foodId: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          isVegetarian: food.isVegetarian,
          quantity: Number(quantity),
        });
      }
      cart.updatedAt = new Date();

      return res.status(200).json({
        success: true,
        message: 'Item added to cart.',
        cart,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const newQty = Number(quantity);

    if (isDbLive()) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      if (newQty <= 0) {
        cart.items = cart.items.filter(
          (item) => item.foodId.toString() !== itemId && item._id.toString() !== itemId
        );
      } else {
        const item = cart.items.find(
          (item) => item.foodId.toString() === itemId || item._id.toString() === itemId
        );
        if (item) {
          item.quantity = newQty;
        }
      }

      if (cart.items.length === 0) {
        cart.restaurantId = null;
      }

      await cart.save();
      await cart.populate('items.foodId');

      return res.status(200).json({
        success: true,
        cart,
      });
    } else {
      let cart = memoryStore.carts.find(
        (c) => c.userId.toString() === userId.toString()
      );
      if (cart) {
        if (newQty <= 0) {
          cart.items = cart.items.filter(
            (i) => i.foodId.toString() !== itemId && i._id?.toString() !== itemId
          );
        } else {
          const item = cart.items.find(
            (i) => i.foodId.toString() === itemId || i._id?.toString() === itemId
          );
          if (item) item.quantity = newQty;
        }
        if (cart.items.length === 0) cart.restaurantId = null;
        cart.updatedAt = new Date();
      }
      return res.status(200).json({
        success: true,
        cart,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (isDbLive()) {
      let cart = await Cart.findOne({ userId });
      if (cart) {
        cart.items = [];
        cart.restaurantId = null;
        await cart.save();
      }
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully.',
        cart: cart || { items: [] },
      });
    } else {
      let cart = memoryStore.carts.find(
        (c) => c.userId.toString() === userId.toString()
      );
      if (cart) {
        cart.items = [];
        cart.restaurantId = null;
      }
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully.',
        cart: cart || { items: [] },
      });
    }
  } catch (error) {
    next(error);
  }
};
