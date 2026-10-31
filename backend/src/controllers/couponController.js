import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a coupon code.',
      });
    }

    const orderSubtotal = Number(subtotal) || 0;
    const normalizedCode = code.toUpperCase().trim();

    let coupon;
    if (isDbLive()) {
      coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });
    } else {
      coupon = memoryStore.coupons.find(
        (c) => c.code === normalizedCode && c.isActive
      );
    }

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon code.',
      });
    }

    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired.',
      });
    }

    // Check minimum order value
    if (orderSubtotal < coupon.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order of ₹${coupon.minimumOrderValue}.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Prevent discount > subtotal
    if (discount > orderSubtotal) {
      discount = orderSubtotal;
    }

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied! You save ₹${discount}.`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    if (isDbLive()) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, coupons });
    } else {
      return res.status(200).json({
        success: true,
        coupons: memoryStore.coupons,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderValue,
      maximumDiscount,
      expiryDate,
      isActive,
    } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount value, and expiry date are required.',
      });
    }

    const normalizedCode = code.toUpperCase().trim();

    if (isDbLive()) {
      const existing = await Coupon.findOne({ code: normalizedCode });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists.',
        });
      }

      const coupon = await Coupon.create({
        code: normalizedCode,
        description: description || '',
        discountType: discountType || 'percentage',
        discountValue: Number(discountValue),
        minimumOrderValue: Number(minimumOrderValue) || 0,
        maximumDiscount: Number(maximumDiscount) || 200,
        expiryDate: new Date(expiryDate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      });

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully.',
        coupon,
      });
    } else {
      const existing = memoryStore.coupons.find((c) => c.code === normalizedCode);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists.',
        });
      }

      const newCoupon = {
        _id: new mongoose.Types.ObjectId().toString(),
        code: normalizedCode,
        description: description || '',
        discountType: discountType || 'percentage',
        discountValue: Number(discountValue),
        minimumOrderValue: Number(minimumOrderValue) || 0,
        maximumDiscount: Number(maximumDiscount) || 200,
        expiryDate: new Date(expiryDate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        usageCount: 0,
        createdAt: new Date(),
      };
      memoryStore.coupons.push(newCoupon);

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully.',
        coupon: newCoupon,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) updateData.code = updateData.code.toUpperCase().trim();
    if (updateData.discountValue)
      updateData.discountValue = Number(updateData.discountValue);

    if (isDbLive()) {
      const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully.',
        coupon,
      });
    } else {
      const idx = memoryStore.coupons.findIndex(
        (c) => c._id.toString() === id.toString()
      );
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found.',
        });
      }
      memoryStore.coupons[idx] = {
        ...memoryStore.coupons[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully.',
        coupon: memoryStore.coupons[idx],
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbLive()) {
      await Coupon.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully.',
      });
    } else {
      memoryStore.coupons = memoryStore.coupons.filter(
        (c) => c._id.toString() !== id.toString()
      );
      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
};
