import React from 'react';
import { UtensilsCrossed, ShieldCheck, Heart, Award, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <UtensilsCrossed size={32} />
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.4rem' }}>
            About FoodieHub
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700 }}>
            "Your Cravings, Delivered Fresh."
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          lineHeight: '1.8',
          color: 'var(--text-main)',
          fontSize: '1rem',
        }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.75rem' }}>
            Our Culinary Mission
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            FoodieHub was founded with a singular passion: bringing authentic, piping hot, hygienic meals directly from premier kitchens to hungry foodies in 30 minutes. Whether it's an authentic Dum Biryani cooked in clay pots, an artisanal sourdough pizza baked in wood-fired ovens, or warm decadent chocolate brownies, FoodieHub ensures that every meal tastes as fresh as when it was pulled from the oven.
          </p>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.75rem' }}>
            Academic Engineering Project
          </h3>
          <p style={{ marginBottom: '2rem' }}>
            This application is created as a comprehensive, production-grade full-stack demonstration for an intermediate B.Tech Computer Science and Engineering portfolio. It demonstrates modern architectural patterns including RESTful APIs, token/cookie authentication, role-based access control, Razorpay payment gateway verification, Google Sign-In, and responsive mobile-first React UI design.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-light)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <ShieldCheck size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--charcoal)' }}>Secure & Verified</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cryptographic signatures & role protection</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Heart size={32} color="var(--nonveg-color)" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--charcoal)' }}>Cooked with Care</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Only top rated partner restaurants</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Users size={32} color="#0284c7" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--charcoal)' }}>50,000+ Orders</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Delivered to doorsteps nationwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
