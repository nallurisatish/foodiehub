import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.js';
import { Food } from '../models/Food.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';

export const getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, isOpen, sort, featured } = req.query;

    if (isDbLive()) {
      let query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { cuisineTypes: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (cuisine && cuisine !== 'all') {
        query.cuisineTypes = { $regex: cuisine, $options: 'i' };
      }

      if (isOpen !== undefined) {
        query.isOpen = isOpen === 'true';
      }

      if (featured === 'true') {
        query.featured = true;
      }

      let sortOptions = { rating: -1 };
      if (sort === 'rating') sortOptions = { rating: -1 };
      if (sort === 'deliveryTime') sortOptions = { estimatedDeliveryTime: 1 };
      if (sort === 'priceLow') sortOptions = { priceForTwo: 1 };
      if (sort === 'priceHigh') sortOptions = { priceForTwo: -1 };

      const restaurants = await Restaurant.find(query).sort(sortOptions);

      return res.status(200).json({
        success: true,
        count: restaurants.length,
        restaurants,
      });
    } else {
      // Memory fallback
      let list = [...memoryStore.restaurants];

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(
          (r) =>
            r.name.toLowerCase().includes(s) ||
            r.cuisineTypes.some((c) => c.toLowerCase().includes(s))
        );
      }

      if (cuisine && cuisine !== 'all') {
        list = list.filter((r) =>
          r.cuisineTypes.some((c) =>
            c.toLowerCase().includes(cuisine.toLowerCase())
          )
        );
      }

      if (isOpen !== undefined) {
        const openBool = isOpen === 'true';
        list = list.filter((r) => r.isOpen === openBool);
      }

      if (featured === 'true') {
        list = list.filter((r) => r.featured);
      }

      if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
      if (sort === 'priceLow') list.sort((a, b) => a.priceForTwo - b.priceForTwo);
      if (sort === 'priceHigh') list.sort((a, b) => b.priceForTwo - a.priceForTwo);

      return res.status(200).json({
        success: true,
        count: list.length,
        restaurants: list,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbLive()) {
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found.',
        });
      }

      const foods = await Food.find({ restaurantId: id });

      return res.status(200).json({
        success: true,
        restaurant,
        menu: foods,
      });
    } else {
      const restaurant = memoryStore.restaurants.find(
        (r) => r._id.toString() === id.toString()
      );
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found.',
        });
      }

      const menu = memoryStore.foods.filter(
        (f) => f.restaurantId.toString() === id.toString()
      );

      return res.status(200).json({
        success: true,
        restaurant,
        menu,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (req, res, next) => {
  try {
    const {
      name,
      description,
      cuisineTypes,
      image,
      address,
      contactPhone,
      deliveryFee,
      estimatedDeliveryTime,
      isOpen,
      priceForTwo,
    } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant name and cover image URL are required.',
      });
    }

    const cuisines = Array.isArray(cuisineTypes)
      ? cuisineTypes
      : cuisineTypes
      ? cuisineTypes.split(',').map((c) => c.trim())
      : ['Multi-Cuisine'];

    if (isDbLive()) {
      const restaurant = await Restaurant.create({
        name,
        description: description || '',
        cuisineTypes: cuisines,
        image,
        address: address || { city: 'Bengaluru' },
        contactPhone: contactPhone || '',
        deliveryFee: Number(deliveryFee) || 40,
        estimatedDeliveryTime: estimatedDeliveryTime || '30-40 min',
        isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
        priceForTwo: Number(priceForTwo) || 400,
      });

      return res.status(201).json({
        success: true,
        message: 'Restaurant created successfully.',
        restaurant,
      });
    } else {
      const newRest = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        description: description || '',
        cuisineTypes: cuisines,
        image,
        address: address || { city: 'Bengaluru' },
        contactPhone: contactPhone || '',
        deliveryFee: Number(deliveryFee) || 40,
        estimatedDeliveryTime: estimatedDeliveryTime || '30-40 min',
        rating: 4.5,
        ratingCount: 1,
        isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
        priceForTwo: Number(priceForTwo) || 400,
        createdAt: new Date(),
      };
      memoryStore.restaurants.push(newRest);

      return res.status(201).json({
        success: true,
        message: 'Restaurant created successfully.',
        restaurant: newRest,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (typeof updateData.cuisineTypes === 'string') {
      updateData.cuisineTypes = updateData.cuisineTypes
        .split(',')
        .map((c) => c.trim());
    }

    if (isDbLive()) {
      const updated = await Restaurant.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Restaurant updated successfully.',
        restaurant: updated,
      });
    } else {
      const idx = memoryStore.restaurants.findIndex(
        (r) => r._id.toString() === id.toString()
      );
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found.',
        });
      }
      memoryStore.restaurants[idx] = {
        ...memoryStore.restaurants[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      return res.status(200).json({
        success: true,
        message: 'Restaurant updated successfully.',
        restaurant: memoryStore.restaurants[idx],
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbLive()) {
      const deleted = await Restaurant.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found.',
        });
      }
      // Also delete associated foods
      await Food.deleteMany({ restaurantId: id });

      return res.status(200).json({
        success: true,
        message: 'Restaurant and its menu items removed.',
      });
    } else {
      const idx = memoryStore.restaurants.findIndex(
        (r) => r._id.toString() === id.toString()
      );
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found.',
        });
      }
      memoryStore.restaurants.splice(idx, 1);
      memoryStore.foods = memoryStore.foods.filter(
        (f) => f.restaurantId.toString() !== id.toString()
      );

      return res.status(200).json({
        success: true,
        message: 'Restaurant and its menu items removed.',
      });
    }
  } catch (error) {
    next(error);
  }
};
