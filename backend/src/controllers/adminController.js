import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Food } from '../models/Food.js';
import { Restaurant } from '../models/Restaurant.js';
import { isDbLive, memoryStore } from '../utils/dataStore.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    if (isDbLive()) {
      const [totalOrders, totalCustomers, totalFoods, totalRestaurants, orders] =
        await Promise.all([
          Order.countDocuments(),
          User.countDocuments({ role: 'customer' }),
          Food.countDocuments(),
          Restaurant.countDocuments(),
          Order.find().sort({ createdAt: -1 }),
        ]);

      let totalRevenue = 0;
      let pendingOrders = 0;
      let deliveredOrders = 0;
      const salesByDayMap = {};

      orders.forEach((order) => {
        if (order.paymentStatus === 'Paid' || (order.paymentMethod === 'Cash on Delivery' && order.orderStatus === 'Delivered')) {
          totalRevenue += order.totalAmount;
        }

        if (['Pending', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(order.orderStatus)) {
          pendingOrders++;
        }

        if (order.orderStatus === 'Delivered') {
          deliveredOrders++;
        }

        // Daily chart data
        const dateKey = new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        salesByDayMap[dateKey] = (salesByDayMap[dateKey] || 0) + order.totalAmount;
      });

      const recentOrders = orders.slice(0, 6);
      const topDishes = await Food.find({ bestseller: true }).limit(5);

      const chartData = Object.entries(salesByDayMap).map(([day, revenue]) => ({
        day,
        revenue,
      }));

      return res.status(200).json({
        success: true,
        metrics: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalCustomers,
          totalFoods,
          totalRestaurants,
          recentOrders,
          topDishes,
          chartData: chartData.length > 0 ? chartData : [
            { day: 'Mon', revenue: 3200 },
            { day: 'Tue', revenue: 4500 },
            { day: 'Wed', revenue: 3900 },
            { day: 'Thu', revenue: 5800 },
            { day: 'Fri', revenue: 7200 },
            { day: 'Sat', revenue: 9400 },
            { day: 'Sun', revenue: 8600 },
          ],
        },
      });
    } else {
      const orders = memoryStore.orders;
      const totalOrders = orders.length;
      const totalCustomers = memoryStore.users.filter(
        (u) => u.role === 'customer'
      ).length;
      const totalFoods = memoryStore.foods.length;
      const totalRestaurants = memoryStore.restaurants.length;

      let totalRevenue = 0;
      let pendingOrders = 0;
      let deliveredOrders = 0;

      orders.forEach((o) => {
        if (o.paymentStatus === 'Paid' || (o.paymentMethod === 'Cash on Delivery' && o.orderStatus === 'Delivered')) {
          totalRevenue += o.totalAmount;
        }
        if (['Pending', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(o.orderStatus)) {
          pendingOrders++;
        }
        if (o.orderStatus === 'Delivered') {
          deliveredOrders++;
        }
      });

      return res.status(200).json({
        success: true,
        metrics: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalCustomers,
          totalFoods,
          totalRestaurants,
          recentOrders: orders.slice(0, 6),
          topDishes: memoryStore.foods.slice(0, 5),
          chartData: [
            { day: 'Mon', revenue: 2400 },
            { day: 'Tue', revenue: 3800 },
            { day: 'Wed', revenue: 4200 },
            { day: 'Thu', revenue: 5100 },
            { day: 'Fri', revenue: 6900 },
            { day: 'Sat', revenue: 8800 },
            { day: 'Sun', revenue: 7600 },
          ],
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    if (isDbLive()) {
      let query = {};
      if (status && status !== 'all') {
        query.orderStatus = status;
      }
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { restaurantName: { $regex: search, $options: 'i' } },
          { 'deliveryAddress.name': { $regex: search, $options: 'i' } },
        ];
      }

      const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .populate('restaurantId', 'name address')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } else {
      let orders = [...memoryStore.orders];
      if (status && status !== 'all') {
        orders = orders.filter((o) => o.orderStatus === status);
      }
      if (search) {
        const s = search.toLowerCase();
        orders = orders.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(s) ||
            o.restaurantName?.toLowerCase().includes(s) ||
            o.deliveryAddress?.name?.toLowerCase().includes(s)
        );
      }
      return res.status(200).json({
        success: true,
        count: orders.length,
        orders: orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
      });
    }

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

    // Business rule: Do not move terminal statuses (Delivered, Cancelled) backward
    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update an order that is already '${order.orderStatus}'.`,
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      comment: comment || `Status updated to ${status} by administrator.`,
    });

    // If COD order marked delivered, mark payment collected
    if (status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
      order.paidAt = new Date();
    }

    if (isDbLive()) {
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomers = async (req, res, next) => {
  try {
    if (isDbLive()) {
      const customers = await User.find({ role: 'customer' })
        .select('-passwordHash')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: customers.length,
        customers,
      });
    } else {
      const customers = memoryStore.users
        .filter((u) => u.role === 'customer')
        .map(({ passwordHash, ...rest }) => rest);

      return res.status(200).json({
        success: true,
        count: customers.length,
        customers,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    let orders = [];
    if (isDbLive()) {
      orders = await Order.find();
    } else {
      orders = memoryStore.orders;
    }

    let totalRevenue = 0;
    let successfulOrders = 0;
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Preparing: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((o) => {
      statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
      if (o.paymentStatus === 'Paid' || (o.paymentMethod === 'Cash on Delivery' && o.orderStatus === 'Delivered')) {
        totalRevenue += o.totalAmount;
        successfulOrders++;
      }
    });

    const averageOrderValue = successfulOrders > 0
      ? Math.round(totalRevenue / successfulOrders)
      : 0;

    return res.status(200).json({
      success: true,
      reports: {
        totalRevenue,
        successfulOrders,
        averageOrderValue,
        statusDistribution: statusCounts,
        currency: 'INR',
      },
    });
  } catch (error) {
    next(error);
  }
};
