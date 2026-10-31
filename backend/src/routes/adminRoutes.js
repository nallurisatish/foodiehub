import express from 'express';
import {
  getDashboardMetrics,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  getReports,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardMetrics);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAllCustomers);
router.get('/reports', getReports);

export default router;
