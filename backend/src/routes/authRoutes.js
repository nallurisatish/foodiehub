import express from 'express';
import {
  register,
  login,
  googleAuth,
  getMe,
  logout,
  updateProfile,
  addAddress,
  deleteAddress,
  getGoogleClientId,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/google-client-id', getGoogleClientId);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/addresses', authenticate, addAddress);
router.delete('/addresses/:addressId', authenticate, deleteAddress);

export default router;
