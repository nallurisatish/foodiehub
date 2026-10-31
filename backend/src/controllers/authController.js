import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { verifyGoogleIdToken } from '../config/google.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'foodiehub_super_secret_jwt_key_2026_secure_random_string_987654321';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbLive()) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || '',
        passwordHash: password, // pre-save hook hashes it
        role: 'customer',
      });

      const token = generateToken(user);
      const userRes = user.toObject();
      delete userRes.passwordHash;

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to FoodieHub.',
        token,
        user: userRes,
      });
    } else {
      // Memory fallback
      const existing = memoryStore.users.find((u) => u.email === normalizedEmail);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || '',
        passwordHash,
        role: 'customer',
        addresses: [],
        createdAt: new Date(),
      };
      memoryStore.users.push(newUser);

      const token = generateToken(newUser);
      const { passwordHash: _, ...userRes } = newUser;

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to FoodieHub.',
        token,
        user: userRes,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user;
    let isMatch = false;

    if (isDbLive()) {
      user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
      if (user && user.passwordHash) {
        isMatch = await user.comparePassword(password);
      }
    } else {
      user = memoryStore.users.find((u) => u.email === normalizedEmail);
      if (user && user.passwordHash) {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);
    const userRes = user.toObject ? user.toObject() : { ...user };
    delete userRes.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Login successful. Welcome back!',
      token,
      user: userRes,
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const credential = req.body.credential || req.body.token || req.body.access_token;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential or access token is required.',
      });
    }

    const payload = await verifyGoogleIdToken(credential);
    const { email, name, sub, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    let user;

    if (isDbLive()) {
      user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        // Create new customer account (Google Sign-In never grants admin)
        user = await User.create({
          name: name || 'Google Foodie',
          email: normalizedEmail,
          googleSubject: sub,
          avatar: picture || '',
          role: 'customer',
        });
      } else if (!user.googleSubject) {
        // Link googleSubject
        user.googleSubject = sub;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      user = memoryStore.users.find((u) => u.email === normalizedEmail);

      if (!user) {
        user = {
          _id: new mongoose.Types.ObjectId().toString(),
          name: name || 'Google Foodie',
          email: normalizedEmail,
          googleSubject: sub,
          avatar: picture || '',
          role: 'customer',
          addresses: [],
          createdAt: new Date(),
        };
        memoryStore.users.push(user);
      } else {
        user.googleSubject = sub;
        if (picture && !user.avatar) user.avatar = picture;
      }
    }

    const token = generateToken(user);
    const userRes = user.toObject ? user.toObject() : { ...user };
    delete userRes.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully!',
      token,
      user: userRes,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user._id;

    if (isDbLive()) {
      const updated = await User.findByIdAndUpdate(
        userId,
        {
          ...(name && { name: name.trim() }),
          ...(phone !== undefined && { phone }),
        },
        { new: true }
      ).select('-passwordHash');

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: updated,
      });
    } else {
      const idx = memoryStore.users.findIndex(
        (u) => u._id.toString() === userId.toString()
      );
      if (idx !== -1) {
        if (name) memoryStore.users[idx].name = name.trim();
        if (phone !== undefined) memoryStore.users[idx].phone = phone;
        const { passwordHash, ...userRes } = memoryStore.users[idx];
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully.',
          user: userRes,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const { label, street, landmark, city, state, pincode, phone, isDefault } =
      req.body;

    if (!street || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Street, city, and pincode are required.',
      });
    }

    const newAddr = {
      _id: new mongoose.Types.ObjectId().toString(),
      label: label || 'Home',
      street,
      landmark: landmark || '',
      city,
      state: state || '',
      pincode,
      phone: phone || req.user.phone || '',
      isDefault: Boolean(isDefault),
    };

    if (isDbLive()) {
      const user = await User.findById(req.user._id);
      if (isDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
      }
      user.addresses.push(newAddr);
      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Address added successfully.',
        addresses: user.addresses,
      });
    } else {
      const user = memoryStore.users.find(
        (u) => u._id.toString() === req.user._id.toString()
      );
      if (user) {
        if (!user.addresses) user.addresses = [];
        if (isDefault) {
          user.addresses.forEach((a) => (a.isDefault = false));
        }
        user.addresses.push(newAddr);
        return res.status(201).json({
          success: true,
          message: 'Address added successfully.',
          addresses: user.addresses,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    if (isDbLive()) {
      const user = await User.findById(req.user._id);
      user.addresses = user.addresses.filter(
        (a) => a._id.toString() !== addressId.toString()
      );
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Address removed successfully.',
        addresses: user.addresses,
      });
    } else {
      const user = memoryStore.users.find(
        (u) => u._id.toString() === req.user._id.toString()
      );
      if (user && user.addresses) {
        user.addresses = user.addresses.filter(
          (a) => a._id.toString() !== addressId.toString()
        );
        return res.status(200).json({
          success: true,
          message: 'Address removed successfully.',
          addresses: user.addresses,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};
