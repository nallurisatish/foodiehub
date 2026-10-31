import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Pizza,
  ShoppingBag,
  Tag,
  ArrowLeft,
  LogOut,
  Menu as MenuIcon,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Restaurants', path: '/admin/restaurants', icon: UtensilsCrossed },
    { label: 'Food Menu', path: '/admin/food', icon: Pizza },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--charcoal)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 90,
          transition: 'transform 0.3s ease',
          boxShadow: 'var(--shadow-xl)',
        }}
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        {/* Brand Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UtensilsCrossed size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', color: 'white', lineHeight: 1.1 }}>FoodieHub</h2>
              <span style={{ fontSize: '0.7rem', color: '#fb923c', fontWeight: 700, textTransform: 'uppercase' }}>
                Admin Portal
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            style={{ color: 'white', display: 'none' }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: active ? 'white' : '#94a3b8',
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: Back to store & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              color: '#94a3b8',
              fontSize: '0.85rem',
              marginBottom: '0.4rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }} className="admin-main">
        {/* Top Navbar */}
        <header style={{
          height: '70px',
          backgroundColor: 'white',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 80,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ display: 'none', color: 'var(--charcoal)' }}
            className="mobile-open-btn"
          >
            <MenuIcon size={24} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Logged in as
            </span>
            <span style={{ fontWeight: 700, color: 'var(--charcoal)', fontSize: '0.95rem' }}>
              {user?.name || 'Administrator'}
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            System Time: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        {/* Content View */}
        <main style={{ padding: '1.75rem', flexGrow: 1 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .mobile-open-btn {
            display: block !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
