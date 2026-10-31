import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Heart,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--charcoal)',
      color: '#cbd5e1',
      paddingTop: '4rem',
      paddingBottom: '2rem',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      <div className="container">
        {/* Value Assurance Badges Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '3rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>Lightning Fast Delivery</h4>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Fresh meals in 30-40 minutes</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(22, 163, 74, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--veg-color)',
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>Hygiene Assured</h4>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Certified sanitized kitchen partners</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>Secure Payments</h4>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Razorpay UPI, Cards & Cash on Delivery</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>Exclusive Discounts</h4>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Use promo code FOODIE50 for 50% off</p>
            </div>
          </div>
        </div>

        {/* 4-Column Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '3rem',
        }}>
          {/* Col 1: Brand & Bio */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                <UtensilsCrossed size={20} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>
                Foodie<span style={{ color: 'var(--primary)' }}>Hub</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem', color: '#94a3b8' }}>
              "Your Cravings, Delivered Fresh." Delivering gourmet dishes, street favorites, and comfort food from premier local restaurants right to your doorstep.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <span
                  key={social}
                  style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {social}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link to="/" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Home</Link></li>
              <li><Link to="/restaurants" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Browse Restaurants</Link></li>
              <li><Link to="/menu" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Explore Menu</Link></li>
              <li><Link to="/orders" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Track Order</Link></li>
              <li><Link to="/admin/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Administrator Portal</Link></li>
            </ul>
          </div>

          {/* Col 3: Cuisines */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Popular Cuisines
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link to="/menu?category=Biryani" style={{ color: '#94a3b8' }}>Royal Dum Biryani</Link></li>
              <li><Link to="/menu?category=Pizza" style={{ color: '#94a3b8' }}>Artisanal Pizza</Link></li>
              <li><Link to="/menu?category=Indian Meals" style={{ color: '#94a3b8' }}>North Indian Curries</Link></li>
              <li><Link to="/menu?category=Burgers" style={{ color: '#94a3b8' }}>Gourmet Burgers</Link></li>
              <li><Link to="/menu?category=Desserts" style={{ color: '#94a3b8' }}>Fudge Brownies & Sweets</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Legal */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Get In Touch
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="var(--primary)" />
                <span>Live Food Delivery Network • Operating Across All Indian Cities</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={18} color="var(--primary)" />
                <span>+91 80 4000 5555 / 1800-FOODIE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} color="var(--primary)" />
                <span>support@foodiehub.demo</span>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                <Link to="/privacy" style={{ color: '#64748b' }}>Privacy Policy</Link>
                <span>•</span>
                <Link to="/terms" style={{ color: '#64748b' }}>Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.825rem',
          color: '#64748b',
        }}>
          <p>© {new Date().getFullYear()} FoodieHub Technologies Inc. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Built for B.Tech Computer Science Engineering with <Heart size={14} color="var(--primary)" fill="var(--primary)" /> MERN Stack
          </p>
        </div>
      </div>
    </footer>
  );
}
