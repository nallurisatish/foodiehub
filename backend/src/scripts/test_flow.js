import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runEndToEndTests() {
  console.log('🚀 Starting Comprehensive End-to-End Test Suite for FoodieHub...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Checking API Health...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health Check:', healthRes.data.status, '| App:', healthRes.data.app);

    // 2. Fetch Restaurants & Foods
    console.log('\n2️⃣ Fetching Restaurant and Food Catalog...');
    const restRes = await axios.get(`${BASE_URL}/restaurants`);
    console.log(`   ✅ Loaded ${restRes.data.count} restaurants.`);
    const restaurant = restRes.data.restaurants[0];
    console.log(`   Sample Restaurant: "${restaurant.name}" (${restaurant._id})`);

    const foodRes = await axios.get(`${BASE_URL}/food?restaurantId=${restaurant._id}`);
    console.log(`   ✅ Loaded ${foodRes.data.count} dishes for ${restaurant.name}.`);
    const dish1 = foodRes.data.foods[0];
    const dish2 = foodRes.data.foods[1] || dish1;
    console.log(`   Sample Dish 1: "${dish1.name}" (₹${dish1.price})`);

    // 3. Register New Customer
    console.log('\n3️⃣ Testing Customer Registration...');
    const testEmail = `foodie_test_${Date.now()}@example.com`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Rohan Mehra',
      email: testEmail,
      phone: '+91 98765 12345',
      password: 'Password@123',
    });
    console.log('   ✅ Customer Registered:', regRes.data.user.email);
    const customerToken = regRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${customerToken}` } };

    // 4. Test Customer Login
    console.log('\n4️⃣ Testing Customer Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'Password@123',
    });
    console.log('   ✅ Login Success:', loginRes.data.user.name, '| Role:', loginRes.data.user.role);

    // 5. Test Coupon Validation
    console.log('\n5️⃣ Testing Coupon Validation (FOODIE50)...');
    const couponRes = await axios.post(`${BASE_URL}/coupons/validate`, {
      code: 'FOODIE50',
      subtotal: 400,
    });
    console.log('   ✅ Coupon Validated:', couponRes.data.message, '| Discount:', couponRes.data.coupon.discountAmount);

    // 6. Test Placing Order (Razorpay Payment Method)
    console.log('\n6️⃣ Testing Order Creation (Server-side Pricing & Validation)...');
    const orderPayload = {
      restaurantId: restaurant._id,
      items: [
        { foodId: dish1._id, name: dish1.name, price: dish1.price, quantity: 2 },
        { foodId: dish2._id, name: dish2.name, price: dish2.price, quantity: 1 },
      ],
      deliveryAddress: {
        name: 'Rohan Mehra',
        phone: '+91 98765 12345',
        street: '104, Palm Grove Heights, Koramangala',
        landmark: 'Near Forum Mall',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560095',
      },
      deliveryInstructions: 'Leave with security guard',
      paymentMethod: 'Razorpay',
      couponCode: 'FOODIE50',
    };

    const orderRes = await axios.post(`${BASE_URL}/orders`, orderPayload, authHeaders);
    console.log('   ✅ Order Placed successfully!');
    console.log('   Order Number:', orderRes.data.order.orderNumber);
    console.log('   Subtotal:', `₹${orderRes.data.order.subtotal}`);
    console.log('   Discount:', `₹${orderRes.data.order.discount}`);
    console.log('   Delivery Fee:', `₹${orderRes.data.order.deliveryFee}`);
    console.log('   GST Tax (5%):', `₹${orderRes.data.order.tax}`);
    console.log('   Grand Total:', `₹${orderRes.data.order.totalAmount}`);
    console.log('   Gateway Order ID:', orderRes.data.order.gatewayOrderId);
    const orderId = orderRes.data.order._id;

    // 7. Test Payment Verification (Razorpay signature)
    console.log('\n7️⃣ Testing Payment Signature Verification & Order Confirmation...');
    const verifyRes = await axios.post(
      `${BASE_URL}/payments/razorpay/verify`,
      {
        orderId,
        razorpayOrderId: orderRes.data.order.gatewayOrderId,
        razorpayPaymentId: `pay_test_sim_${Date.now()}`,
        razorpaySignature: 'simulated_test_signature',
      },
      authHeaders
    );
    console.log('   ✅ Payment Verified:', verifyRes.data.message);
    console.log('   Order Status Updated To:', verifyRes.data.order.orderStatus);
    console.log('   Payment Status:', verifyRes.data.order.paymentStatus);

    // 8. Test Customer Order Tracking
    console.log('\n8️⃣ Testing Customer Order Details & Tracking...');
    const trackRes = await axios.get(`${BASE_URL}/orders/${orderId}`, authHeaders);
    console.log('   ✅ Order Retrieved:', trackRes.data.order.orderNumber);
    console.log('   Status History Entries:', trackRes.data.order.statusHistory.length);

    // 9. Test Administrator Login
    console.log('\n9️⃣ Testing Administrator Login & Protected Access...');
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@foodiehub.com',
      password: 'Admin@123456',
    });
    console.log('   ✅ Admin Authenticated:', adminLoginRes.data.user.name, '| Role:', adminLoginRes.data.user.role);
    const adminToken = adminLoginRes.data.token;
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 10. Test Admin Dashboard Metrics & Order Status Update
    console.log('\n🔟 Testing Administrator Dashboard Metrics...');
    const metricsRes = await axios.get(`${BASE_URL}/admin/dashboard`, adminHeaders);
    console.log('   ✅ Admin Metrics:');
    console.log('      - Total Revenue: ₹' + metricsRes.data.metrics.totalRevenue);
    console.log('      - Total Orders: ' + metricsRes.data.metrics.totalOrders);
    console.log('      - Total Customers: ' + metricsRes.data.metrics.totalCustomers);
    console.log('      - Recent Orders Count: ' + metricsRes.data.metrics.recentOrders.length);

    // 11. Test Admin Updating Order Status to 'Preparing' then 'Out for Delivery'
    console.log('\n1️⃣1️⃣ Testing Admin Updating Order Status...');
    const updateRes = await axios.patch(
      `${BASE_URL}/admin/orders/${orderId}/status`,
      { status: 'Preparing', comment: 'Chef has started preparing Dum Biryani' },
      adminHeaders
    );
    console.log('   ✅ Order Status Changed to:', updateRes.data.order.orderStatus);

    const updateRes2 = await axios.patch(
      `${BASE_URL}/admin/orders/${orderId}/status`,
      { status: 'Out for Delivery', comment: 'Delivery partner Ramesh has picked up package' },
      adminHeaders
    );
    console.log('   ✅ Order Status Changed to:', updateRes2.data.order.orderStatus);

    console.log('\n🎉 ALL 11 WORKFLOW PHASES PASSED WITH ZERO ERRORS!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runEndToEndTests();
