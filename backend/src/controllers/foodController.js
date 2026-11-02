import mongoose from 'mongoose';
import { Food } from '../models/Food.js';
import { Restaurant } from '../models/Restaurant.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';
import { seedDemoData } from '../scripts/seedDemoData.js';

export const getFoods = async (req, res, next) => {
  try {
    const {
      search,
      category,
      isVegetarian,
      restaurantId,
      bestseller,
      sort,
      isAvailable,
    } = req.query;

    if (isDbLive()) {
      let query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ];
      }

      if (category && category !== 'all') {
        query.category = category;
      }

      if (isVegetarian !== undefined && isVegetarian !== 'all') {
        query.isVegetarian = isVegetarian === 'true';
      }

      if (restaurantId) {
        query.restaurantId = restaurantId;
      }

      if (bestseller === 'true') {
        query.bestseller = true;
      }

      if (isAvailable !== undefined) {
        query.isAvailable = isAvailable === 'true';
      }

      let sortOptions = { rating: -1 };
      if (sort === 'priceLow') sortOptions = { price: 1 };
      if (sort === 'priceHigh') sortOptions = { price: -1 };
      if (sort === 'rating') sortOptions = { rating: -1 };

      let foods = await Food.find(query)
        .populate('restaurantId', 'name deliveryFee estimatedDeliveryTime isOpen')
        .sort(sortOptions);

      // Self-healing: If database is connected but foods collection is empty, auto-seed!
      if (foods.length === 0 && !search && (!category || category === 'all')) {
        try {
          const totalInDb = await Food.countDocuments();
          if (totalInDb === 0) {
            console.log('⚡ Empty MongoDB foods detected. Auto-seeding foods...');
            await seedDemoData();
            foods = await Food.find(query)
              .populate('restaurantId', 'name deliveryFee estimatedDeliveryTime isOpen')
              .sort(sortOptions);
          }
        } catch (seedErr) {
          console.warn('Auto-seed foods notice:', seedErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        count: foods.length,
        foods,
      });
    } else {
      let list = [...memoryStore.foods];

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(
          (f) =>
            f.name.toLowerCase().includes(s) ||
            f.description.toLowerCase().includes(s) ||
            (f.tags && f.tags.some((t) => t.toLowerCase().includes(s)))
        );
      }

      if (category && category !== 'all') {
        list = list.filter((f) => f.category === category);
      }

      if (isVegetarian !== undefined && isVegetarian !== 'all') {
        const vegBool = isVegetarian === 'true';
        list = list.filter((f) => f.isVegetarian === vegBool);
      }

      if (restaurantId) {
        list = list.filter(
          (f) => f.restaurantId.toString() === restaurantId.toString()
        );
      }

      if (bestseller === 'true') {
        list = list.filter((f) => f.bestseller);
      }

      if (isAvailable !== undefined) {
        const availBool = isAvailable === 'true';
        list = list.filter((f) => f.isAvailable === availBool);
      }

      if (sort === 'priceLow') list.sort((a, b) => a.price - b.price);
      if (sort === 'priceHigh') list.sort((a, b) => b.price - a.price);
      if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);

      // Attach restaurant info
      const enriched = list.map((f) => {
        const r = memoryStore.restaurants.find(
          (rest) => rest._id.toString() === f.restaurantId.toString()
        );
        return {
          ...f,
          restaurantId: r || { name: 'Foodie Partner' },
        };
      });

      return res.status(200).json({
        success: true,
        count: enriched.length,
        foods: enriched,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getFoodById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbLive()) {
      const food = await Food.findById(id).populate('restaurantId');
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found.',
        });
      }
      return res.status(200).json({
        success: true,
        food,
      });
    } else {
      const food = memoryStore.foods.find(
        (f) => f._id.toString() === id.toString()
      );
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found.',
        });
      }
      const r = memoryStore.restaurants.find(
        (rest) => rest._id.toString() === food.restaurantId.toString()
      );
      return res.status(200).json({
        success: true,
        food: { ...food, restaurantId: r },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createFood = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      restaurantId,
      isVegetarian,
      isAvailable,
      preparationTime,
      tags,
      bestseller,
    } = req.body;

    if (!name || !price || !category || !restaurantId || !image) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, image, and restaurantId are required.',
      });
    }

    const tagsArray = Array.isArray(tags)
      ? tags
      : tags
      ? tags.split(',').map((t) => t.trim())
      : [];

    if (isDbLive()) {
      const food = await Food.create({
        name,
        description: description || '',
        price: Number(price),
        image,
        category,
        restaurantId,
        isVegetarian: Boolean(isVegetarian),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        preparationTime: preparationTime || '20-25 mins',
        tags: tagsArray,
        bestseller: Boolean(bestseller),
      });

      return res.status(201).json({
        success: true,
        message: 'Food item created successfully.',
        food,
      });
    } else {
      const newFood = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        description: description || '',
        price: Number(price),
        image,
        category,
        restaurantId,
        isVegetarian: Boolean(isVegetarian),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        preparationTime: preparationTime || '20-25 mins',
        rating: 4.8,
        ratingCount: 1,
        tags: tagsArray,
        bestseller: Boolean(bestseller),
        createdAt: new Date(),
      };
      memoryStore.foods.push(newFood);

      return res.status(201).json({
        success: true,
        message: 'Food item created successfully.',
        food: newFood,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.price) updateData.price = Number(updateData.price);
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((t) => t.trim());
    }

    if (isDbLive()) {
      const updated = await Food.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Food item updated successfully.',
        food: updated,
      });
    } else {
      const idx = memoryStore.foods.findIndex(
        (f) => f._id.toString() === id.toString()
      );
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found.',
        });
      }
      memoryStore.foods[idx] = {
        ...memoryStore.foods[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      return res.status(200).json({
        success: true,
        message: 'Food item updated successfully.',
        food: memoryStore.foods[idx],
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbLive()) {
      const deleted = await Food.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Food item removed successfully.',
      });
    } else {
      const idx = memoryStore.foods.findIndex(
        (f) => f._id.toString() === id.toString()
      );
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found.',
        });
      }
      memoryStore.foods.splice(idx, 1);
      return res.status(200).json({
        success: true,
        message: 'Food item removed successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
};
