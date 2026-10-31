import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  UtensilsCrossed,
  Pizza,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling store metrics..." />;

  const chartData = metrics?.chartData || [];
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1000);

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
          Platform Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Real-time metrics, order volume, catalog status, and financial performance
        </p>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {/* Total Revenue */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Revenue</span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarSign size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--charcoal)' }}>
            ₹{metrics?.totalRevenue?.toLocaleString('en-IN') || 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--veg-color)', fontWeight: 600 }}>
            From verified orders
          </span>
        </div>

        {/* Total Orders */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Orders</span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--charcoal)' }}>
            {metrics?.totalOrders || 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Lifetime customer orders
          </span>
        </div>

        {/* Pending Orders */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>In-Progress Orders</span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>
            {metrics?.pendingOrders || 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
            Kitchen or dispatch queue
          </span>
        </div>

        {/* Total Customers */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Foodies</span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#dbeafe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--charcoal)' }}>
            {metrics?.totalCustomers || 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
            Active customer accounts
          </span>
        </div>
      </div>

      {/* Sales Trend Chart Visualizer */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--charcoal)' }}>
              Weekly Sales Volume
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Daily gross sales processed across all partner restaurants
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--veg-color)', fontWeight: 700, fontSize: '0.9rem' }}>
            <TrendingUp size={18} />
            <span>+18.4% this week</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: '180px',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderBottom: '1px solid var(--border-color)',
        }}>
          {chartData.map((d, idx) => {
            const heightPercent = Math.max(15, Math.round((d.revenue / maxRevenue) * 100));

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  ₹{d.revenue}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${heightPercent}%`,
                    backgroundColor: idx === chartData.length - 1 ? 'var(--primary)' : '#fed7aa',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.4s ease',
                  }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--charcoal)' }}>
              Recent Orders
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Incoming order queue awaiting management
            </p>
          </div>

          <Link to="/admin/orders" className="btn btn-outline btn-sm">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Order #</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Restaurant</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                metrics?.recentOrders?.map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {ord.orderNumber}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--charcoal)' }}>
                      {ord.restaurantName || 'Restaurant'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-main)' }}>
                      {ord.deliveryAddress?.name || 'Customer'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                      ₹{ord.totalAmount}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor:
                          ord.orderStatus === 'Delivered' ? '#dcfce7' :
                          ord.orderStatus === 'Cancelled' ? '#fee2e2' : '#ffedd5',
                        color:
                          ord.orderStatus === 'Delivered' ? '#16a34a' :
                          ord.orderStatus === 'Cancelled' ? '#dc2626' : '#ea580c',
                      }}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <Link
                        to="/admin/orders"
                        style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
