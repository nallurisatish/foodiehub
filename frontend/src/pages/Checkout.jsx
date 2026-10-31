import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocationContext } from '../context/LocationContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import CheckoutSummary from '../components/CheckoutSummary';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Checkout() {
  const { user, isAuthenticated, addAddress } = useAuth();
  const { items, restaurant, coupon, clearCart } = useCart();
  const { currentLocation, openLocationModal } = useLocationContext();
  const navigate = useNavigate();

  // Address states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: `${currentLocation.locality}, Main Road`,
    landmark: currentLocation.landmark || '',
    city: currentLocation.city || 'Your City',
    state: currentLocation.state || '',
    pincode: currentLocation.pincode || '',
    phone: '',
    name: '',
  });

  // Delivery & payment states
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Primary delivery address always mirrors the active chosen neighborhood
  const activeLocationAddress = {
    _id: 'active_selected_location',
    label: currentLocation.isLiveGPS
      ? `📡 ${currentLocation.locality} (Live GPS Pin)`
      : `📍 ${currentLocation.locality} (Active Choice)`,
    street: currentLocation.street || `Door 42, ${currentLocation.locality}, 1st Main Road`,
    landmark: currentLocation.landmark || 'Near Metro Station',
    city: currentLocation.city || 'Your City',
    state: currentLocation.state || '',
    pincode: currentLocation.pincode || '',
    phone: user?.phone || '+91 98765 43210',
    name: user?.name || 'Customer',
  };

  const userAddresses = [
    activeLocationAddress,
    ...(user?.addresses?.filter((a) => a._id !== 'active_selected_location') || []),
  ];

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
      setErrorMessage('Street, city, and pincode are required for delivery.');
      return;
    }

    try {
      if (isAuthenticated) {
        await addAddress(newAddress);
      }
      setShowNewAddressForm(false);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    const currentAddress = userAddresses[selectedAddressIndex] || userAddresses[0];
    if (!currentAddress || !currentAddress.street) {
      setErrorMessage('Please select or add a valid delivery address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const deliveryCoordinates =
        currentAddress?.coordinates ||
        currentLocation?.coordinates || { lat: 16.5074, lng: 80.6466 };
      const restaurantCoordinates =
        restaurant?.coordinates || { lat: 16.5085, lng: 80.6480 };

      // 1. Create order on the backend
      const orderPayload = {
        restaurantId: restaurant?._id || items[0]?.foodId?.restaurantId || items[0]?.restaurantId,
        deliveryCoordinates,
        restaurantCoordinates,
        items: items.map((i) => ({
          foodId: i.foodId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        deliveryAddress: {
          name: currentAddress.name || user?.name,
          phone: currentAddress.phone || user?.phone || '+91 98765 43210',
          street: currentAddress.street,
          landmark: currentAddress.landmark || '',
          city: currentAddress.city,
          state: currentAddress.state || 'Karnataka',
          pincode: currentAddress.pincode,
        },
        deliveryInstructions,
        paymentMethod,
        couponCode: coupon?.code || null,
      };

      const res = await orderService.createOrder(orderPayload);

      if (!res.success) {
        setErrorMessage(res.message || 'Could not place order.');
        setIsSubmitting(false);
        return;
      }

      const order = res.order;

      // 2. Handle Payment Flow
      if (paymentMethod === 'Cash on Delivery') {
        clearCart();
        navigate(`/order-confirmation/${order._id}`, { state: { order } });
        return;
      }

      // 3. Razorpay Online Payment Flow
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_FoodieHubDev123';

      if (window.Razorpay && !razorpayKey.includes('placeholder')) {
        const options = {
          key: razorpayKey,
          amount: order.totalAmount * 100, // paise
          currency: 'INR',
          name: 'FoodieHub',
          description: `Order ${order.orderNumber} Payment`,
          order_id: res.razorpayOrder?.id,
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || '9876543210',
          },
          theme: {
            color: '#f97316',
          },
          handler: async (response) => {
            try {
              // Verify signature on backend
              const verifyRes = await paymentService.verifyPayment({
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id || res.razorpayOrder?.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                clearCart();
                navigate(`/order-confirmation/${order._id}`, {
                  state: { order: verifyRes.order },
                });
              } else {
                setErrorMessage('Payment verification failed.');
              }
            } catch (err) {
              setErrorMessage('Payment verification error.');
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              setErrorMessage('Payment was cancelled. Your cart has been preserved.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setIsSubmitting(false);
          setErrorMessage(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } else {
        // Test Simulation Mode for Instant Local Demonstration
        setTimeout(async () => {
          const simPaymentId = `pay_test_sim_${Date.now()}`;
          const verifyRes = await paymentService.verifyPayment({
            orderId: order._id,
            razorpayOrderId: res.razorpayOrder?.id || `order_mock_${Date.now()}`,
            razorpayPaymentId: simPaymentId,
            razorpaySignature: 'simulated_test_signature',
          });

          clearCart();
          navigate(`/order-confirmation/${order._id}`, {
            state: { order: verifyRes.order || order },
          });
        }, 1200);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.response?.data?.message || 'Error occurred while processing checkout.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-padding" style={{ minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
            Secure Checkout
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Select your delivery location and preferred payment method
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--nonveg-bg)',
            border: '1px solid #fecaca',
            color: 'var(--nonveg-color)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.75rem',
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
          alignItems: 'flex-start',
        }}>
          {/* LEFT COLUMN: Delivery Address, Instructions & Payment Method */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Step 1: Delivery Address */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} color="var(--primary)" /> 1. Delivery Address
                </h3>

                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  {showNewAddressForm ? 'Cancel' : '+ Add Address'}
                </button>
              </div>

              {/* Active Chosen Neighborhood Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fff7ed',
                border: '1.5px solid #fed7aa',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <MapPin size={18} color="var(--primary)" />
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      Selected Delivery Area
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                      {currentLocation.locality}, {currentLocation.city}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openLocationModal}
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    backgroundColor: 'white',
                    borderColor: 'var(--primary)',
                    color: 'var(--primary-dark)',
                    fontWeight: 700,
                  }}
                >
                  Change Area
                </button>
              </div>

              {/* Saved Addresses Radio Cards */}
              {!showNewAddressForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {userAddresses.map((addr, idx) => {
                    const isSelected = selectedAddressIndex === idx;

                    return (
                      <div
                        key={addr._id || idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.85rem',
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface-alt)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="addressRadio"
                          checked={isSelected}
                          onChange={() => setSelectedAddressIndex(idx)}
                          style={{ accentColor: 'var(--primary)', marginTop: '4px' }}
                        />

                        <div style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              color: 'var(--charcoal)',
                              backgroundColor: 'white',
                              padding: '0.1rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                            }}>
                              {addr.label || 'Home'}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                              {addr.name || user?.name}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              ({addr.phone || user?.phone || 'No phone'})
                            </span>
                          </div>

                          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                            {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* New Address Inline Form */}
              {showNewAddressForm && (
                <form onSubmit={handleAddNewAddress} style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-cream)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div className="form-group">
                    <label className="form-label">Contact Name & Phone</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder="Recipient Name"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        required
                        className="form-input"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address & Flat / Door No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 102, Sunrise Heights, 4th Cross"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Landmark / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite Metro Station"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        placeholder="560038"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save & Use This Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Delivery Instructions */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} color="var(--primary)" /> 2. Delivery Instructions (Optional)
              </h3>
              <input
                type="text"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g., Leave package at door, don't ring doorbell, call upon arrival"
                className="form-input"
              />
            </div>

            {/* Step 3: Payment Method Selection */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--primary)" /> 3. Select Payment Method
              </h3>

              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelectMethod={(method) => setPaymentMethod(method)}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Pay CTA */}
          <div>
            <CheckoutSummary
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={isSubmitting}
              paymentMethod={paymentMethod}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
