import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
    }

    const secret = process.env.JWT_SECRET || 'foodiehub_super_secret_jwt_key_2026_secure_random_string_987654321';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.',
      });
    }

    let user = null;
    if (isDbLive()) {
      user = await User.findById(decoded.id).select('-passwordHash');
    } else {
      user = memoryStore.users.find(
        (u) => u._id.toString() === decoded.id.toString()
      );
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
