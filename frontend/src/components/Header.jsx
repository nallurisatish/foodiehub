import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Search,
  ShieldCheck,
  MapPin,
  ChevronDown,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocationContext } from '../context/LocationContext';
import LocationModal from './LocationModal';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { currentLocation, openLocationModal } = useLocationContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px',
      }}>
        {/* Logo & Tagline */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--charcoal)',
              letterSpacing: '-0.5px',
              display: 'block',
              lineHeight: 1.1,
            }}>
              Foodie<span style={{ color: 'var(--primary)' }}>Hub</span>
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Delivered Fresh
            </span>
          </div>
        </Link>

        {/* Swiggy / Zomato Style Active Location Selector */}
        <div
          onClick={openLocationModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-alt)',
            border: '1.5px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            maxWidth: '280px',
          }}
          className="header-location-btn"
          title="Change delivery location"
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: currentLocation?.isLiveGPS ? '#dcfce7' : 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {currentLocation?.isLiveGPS ? (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a', boxShadow: '0 0 6px #16a34a' }} />
            ) : (
              <MapPin size={14} color="var(--primary)" />
            )}
          </div>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <span style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--charcoal)',
              display: 'inline-block',
              marginRight: '4px',
              borderBottom: '2px solid var(--charcoal)',
            }}>
              {currentLocation?.locality || 'Central Food Hub'}
            </span>
            {currentLocation?.isLiveGPS && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#15803d',
                backgroundColor: '#dcfce7',
                padding: '0.05rem 0.35rem',
                borderRadius: '4px',
                marginRight: '4px',
              }}>
                GPS
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {currentLocation?.city || 'Bengaluru'}
            </span>
          </div>
          <ChevronDown size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
        </div>

        {/* Navigation Desktop */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.75rem' }} className="header-nav">
          <Link
            to="/"
            style={{
              fontWeight: 600,
              color: isActive('/') ? 'var(--primary)' : 'var(--text-main)',
              transition: 'color 0.2s',
            }}
          >
            Home
          </Link>
          <Link
            to="/restaurants"
            style={{
              fontWeight: 600,
              color: isActive('/restaurants') ? 'var(--primary)' : 'var(--text-main)',
              transition: 'color 0.2s',
            }}
          >
            Restaurants
          </Link>
          <Link
            to="/menu"
            style={{
              fontWeight: 600,
              color: isActive('/menu') ? 'var(--primary)' : 'var(--text-main)',
              transition: 'color 0.2s',
            }}
          >
            Explore Menu
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              style={{
                fontWeight: 600,
                color: isActive('/orders') ? 'var(--primary)' : 'var(--text-main)',
                transition: 'color 0.2s',
              }}
            >
              My Orders
            </Link>
          )}
          <Link
            to="/contact"
            style={{
              fontWeight: 600,
              color: isActive('/contact') ? 'var(--primary)' : 'var(--text-main)',
              transition: 'color 0.2s',
            }}
          >
            Contact
          </Link>
        </nav>

        {/* Action Controls (Cart, Search, User Auth) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Cart Icon Button */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-hover)',
              transition: 'transform 0.15s ease',
            }}
            title="View Cart"
          >
            <ShoppingBag size={22} />
            {totalItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 800,
                borderRadius: '999px',
                minWidth: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                boxShadow: '0 2px 6px rgba(249, 115, 22, 0.4)',
                animation: 'scaleIn 0.2s ease',
              }}>
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.8rem',
                  backgroundColor: 'white',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--charcoal)',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '220px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-color)',
                  padding: '0.5rem',
                  zIndex: 200,
                }}>
                  <div style={{
                    padding: '0.6rem 0.8rem',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '0.4rem',
                  }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </p>
                    {isAdmin && (
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        marginTop: '0.3rem',
                      }}>
                        Administrator
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.8rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--primary-light)',
                        marginBottom: '0.3rem',
                      }}
                    >
                      <ShieldCheck size={16} />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <User size={16} />
                    My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <ShoppingBag size={16} />
                    My Orders
                  </Link>

                  <Link
                    to="/addresses"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <MapPin size={16} />
                    Delivery Addresses
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.875rem',
                      color: 'var(--nonveg-color)',
                      borderRadius: 'var(--radius-sm)',
                      borderTop: '1px solid var(--border-light)',
                      marginTop: '0.3rem',
                    }}
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              color: 'var(--charcoal)',
            }}
            className="mobile-toggle"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem 0', color: isActive('/') ? 'var(--primary)' : 'inherit' }}
          >
            Home
          </Link>
          <Link
            to="/restaurants"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem 0', color: isActive('/restaurants') ? 'var(--primary)' : 'inherit' }}
          >
            Restaurants
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem 0', color: isActive('/menu') ? 'var(--primary)' : 'inherit' }}
          >
            Explore Menu
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, padding: '0.5rem 0', color: isActive('/orders') ? 'var(--primary)' : 'inherit' }}
            >
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, padding: '0.5rem 0', color: 'var(--primary)' }}
            >
              Admin Dashboard
            </Link>
          )}
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem 0' }}
          >
            Contact
          </Link>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal />

      <style>{`
        .header-location-btn:hover {
          background-color: white !important;
          border-color: var(--primary) !important;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15);
        }
        @media (min-width: 768px) {
          .header-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
