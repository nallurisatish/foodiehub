import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Compass,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Key,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { orderService } from '../services/orderService';

// Audio chime using Web Audio API (zero external assets needed)
function playArrivalChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Play cheerful 3-tone chime: C5 -> E5 -> G5
    playTone(523.25, now, 0.25);
    playTone(659.25, now + 0.18, 0.25);
    playTone(783.99, now + 0.36, 0.5);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

export default function LiveDeliveryMap({ order, onOrderUpdated }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const progressAnimRef = useRef(null);

  // Initial coordinates fallback
  const restCoord = order?.restaurantCoordinates || { lat: 16.5085, lng: 80.6480 };
  const destCoord = order?.deliveryCoordinates || { lat: 16.5074, lng: 80.6466 };

  // Calculate mid-way curved waypoint path (approx 15 road nodes)
  const generateRouteWaypoints = useCallback((start, end) => {
    const points = [];
    const steps = 30;
    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;

    // Perpendicular offset for realistic road curvature
    const curveOffset = 0.0018;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Parabolic curve deviation
      const curve = Math.sin(t * Math.PI) * curveOffset;
      const lat = start.lat + latDiff * t + curve * 0.7;
      const lng = start.lng + lngDiff * t + curve * 1.2;
      points.push([lat, lng]);
    }
    return points;
  }, []);

  const routeWaypoints = useRef(generateRouteWaypoints(restCoord, destCoord)).current;

  // Initial progress based on status
  const getInitialProgress = () => {
    if (order?.orderStatus === 'Delivered' || order?.riderDetails?.hasArrived) return 1.0;
    if (order?.orderStatus === 'Out for Delivery') return 0.35;
    if (order?.orderStatus === 'Preparing') return 0.05;
    return 0.0;
  };

  const [progress, setProgress] = useState(getInitialProgress);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasArrived, setHasArrived] = useState(
    order?.orderStatus === 'Delivered' || Boolean(order?.riderDetails?.hasArrived)
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync state if order prop changes from outside
  useEffect(() => {
    if (order?.orderStatus === 'Delivered' || order?.riderDetails?.hasArrived) {
      setHasArrived(true);
      setProgress(1.0);
    }
  }, [order?.orderStatus, order?.riderDetails?.hasArrived]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // 1. Restaurant Marker Icon
    const restIcon = L.divIcon({
      className: 'custom-rest-marker',
      html: `
        <div style="
          width: 42px;
          height: 42px;
          background: #ea580c;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.45);
        ">
          <span style="font-size: 20px;">🍳</span>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    const restMarker = L.marker([restCoord.lat, restCoord.lng], { icon: restIcon }).addTo(map);
    restMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
        <strong style="color: #ea580c; display: block; font-size: 14px;">${order?.restaurantName || 'Kitchen Partner'}</strong>
        <span>${order?.restaurantAddress?.street || 'Kitchen Outlet'}, ${order?.restaurantAddress?.locality || ''}</span>
      </div>
    `);

    // 2. Customer Destination Marker Icon
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="
          width: 42px;
          height: 42px;
          background: #16a34a;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.45);
        ">
          <span style="font-size: 20px;">🏠</span>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    const destMarker = L.marker([destCoord.lat, destCoord.lng], { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
        <strong style="color: #16a34a; display: block; font-size: 14px;">Your Delivery Address</strong>
        <span>${order?.deliveryAddress?.street || 'Destination'}, ${order?.deliveryAddress?.city || ''}</span>
      </div>
    `);

    // 3. Route Polyline
    const polyline = L.polyline(routeWaypoints, {
      color: '#f97316',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round',
    }).addTo(map);
    routePolylineRef.current = polyline;

    // Fit bounds to show both restaurant and customer
    const bounds = L.latLngBounds([
      [restCoord.lat, restCoord.lng],
      [destCoord.lat, destCoord.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // 4. Rider Marker Icon with Pulsing Radar
    const currentWaypointIndex = Math.min(
      Math.floor(progress * (routeWaypoints.length - 1)),
      routeWaypoints.length - 1
    );
    const initialRiderPos = routeWaypoints[currentWaypointIndex];

    const riderIcon = L.divIcon({
      className: 'custom-rider-marker',
      html: `
        <div style="position: relative; width: 48px; height: 48px;">
          <div class="rider-radar-pulse"></div>
          <div style="
            position: relative;
            z-index: 2;
            width: 48px;
            height: 48px;
            background: #0f172a;
            border: 3px solid #f97316;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.4);
            color: #f97316;
          ">
            <span style="font-size: 22px;">🛵</span>
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const riderMarker = L.marker(initialRiderPos, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
    riderMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px;">
        <strong style="color: #0f172a;">${order?.riderDetails?.name || 'Vikram Singh'}</strong>
        <div style="color: #64748b; font-size: 12px;">Delivery Partner • ${order?.riderDetails?.vehicleNumber || 'Honda Activa'}</div>
      </div>
    `);
    riderMarkerRef.current = riderMarker;

    return () => {
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [restCoord.lat, restCoord.lng, destCoord.lat, destCoord.lng, generateRouteWaypoints]);

  // Update Rider position on the map as progress changes
  useEffect(() => {
    if (!riderMarkerRef.current || !routeWaypoints.length) return;

    const index = Math.min(
      Math.floor(progress * (routeWaypoints.length - 1)),
      routeWaypoints.length - 1
    );
    const newPos = routeWaypoints[index];
    riderMarkerRef.current.setLatLng(newPos);
  }, [progress, routeWaypoints]);

  // Trigger Arrival Celebration
  const triggerArrivalCelebration = useCallback(async () => {
    setHasArrived(true);
    setIsSimulating(false);

    if (soundEnabled) {
      playArrivalChime();
    }

    // Canvas Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#f97316', '#3b82f6', '#eab308'],
      });
    } catch (e) {}

    // Persist arrival to backend order status
    try {
      if (order?._id) {
        const destPos = routeWaypoints[routeWaypoints.length - 1];
        const res = await orderService.updateRiderLocation(order._id, {
          lat: destPos[0],
          lng: destPos[1],
          hasArrived: true,
          status: 'Delivered',
        });
        if (res.success && onOrderUpdated) {
          onOrderUpdated(res.order);
        }
      }
    } catch (err) {
      console.warn('Sync arrival error:', err);
    }
  }, [order?._id, onOrderUpdated, routeWaypoints, soundEnabled]);

  // Simulate Rider Movement smoothly towards customer
  const startRiderSimulation = () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setHasArrived(false);

    let current = progress >= 0.98 ? 0.05 : progress;
    const stepSpeed = 0.0035; // smooth increment per frame

    const animate = () => {
      current += stepSpeed;
      if (current >= 1.0) {
        setProgress(1.0);
        triggerArrivalCelebration();
      } else {
        setProgress(current);
        progressAnimRef.current = requestAnimationFrame(animate);
      }
    };

    progressAnimRef.current = requestAnimationFrame(animate);
  };

  const resetRiderSimulation = () => {
    if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    setIsSimulating(false);
    setProgress(0.15);
    setHasArrived(false);
  };

  const recenterMap = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [restCoord.lat, restCoord.lng],
      [destCoord.lat, destCoord.lng],
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  // Remaining Distance and ETA calculation
  const totalDistanceKm = 1.6;
  const remainingKm = Math.max(0, Math.round(totalDistanceKm * (1 - progress) * 10) / 10);
  const remainingMeters = Math.max(0, Math.round(totalDistanceKm * (1 - progress) * 1000));
  const remainingMins = Math.max(1, Math.round((1 - progress) * 18));

  const rider = order?.riderDetails || {
    name: 'Vikram Singh',
    phone: '+91 98765 43210',
    vehicleNumber: 'Honda Activa 6G • KA 05 EV 8891',
    rating: 4.85,
    deliveriesCount: 1240,
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      border: '1.5px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      marginBottom: '2rem',
    }}>
      {/* 1. Header Banner */}
      <div style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: hasArrived ? '#16a34a' : '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
          }}>
            {hasArrived ? <CheckCircle2 size={24} /> : <Bike size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: hasArrived ? '#86efac' : '#fed7aa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {hasArrived ? 'Delivery Complete' : 'Live GPS Order Tracking'}
              </span>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: hasArrived ? '#22c55e' : '#f97316',
                animation: hasArrived ? 'none' : 'ping 1.5s infinite',
                display: 'inline-block',
              }} />
            </div>
            <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
              {hasArrived
                ? 'Rider Has Arrived at Your Doorstep!'
                : `Rider is on the way • Arriving in ~${remainingMins} mins`}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute arrival sound' : 'Unmute arrival sound'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            onClick={recenterMap}
            title="Recenter Map View"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Compass size={16} /> Recenter
          </button>

          {!hasArrived ? (
            <button
              type="button"
              onClick={startRiderSimulation}
              disabled={isSimulating}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.825rem',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Sparkles size={15} />
              {isSimulating ? 'Rider Moving...' : '⚡ Simulate Rider Arrival'}
            </button>
          ) : (
            <button
              type="button"
              onClick={resetRiderSimulation}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: 'white',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.825rem',
                fontWeight: 600,
              }}
            >
              <RotateCcw size={15} /> Replay Delivery Run
            </button>
          )}
        </div>
      </div>

      {/* 2. RIDER HAS ARRIVED CELEBRATION CALLOUT */}
      {hasArrived && (
        <div style={{
          backgroundColor: '#dcfce7',
          borderBottom: '2px solid #86efac',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
            }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#166534' }}>
                🎉 {rider.name} is waiting at your doorstep!
              </h4>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#15803d' }}>
                Your piping hot food from <strong>{order?.restaurantName}</strong> is ready for pickup.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            backgroundColor: 'white',
            padding: '0.6rem 1rem',
            borderRadius: '12px',
            border: '1.5px solid #86efac',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Key size={18} color="#16a34a" />
            <div>
              <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Share Delivery PIN
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#166534', letterSpacing: '2px' }}>
                {order?.deliveryPin || '4821'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Leaflet Map Container */}
      <div style={{ position: 'relative', width: '100%', height: '360px' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* Live Distance & ETA Floating Badge on Map */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 400,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          padding: '0.65rem 1rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Remaining Distance
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f97316' }}>
              {hasArrived ? '0 meters' : remainingKm < 1 ? `${remainingMeters} m` : `${remainingKm} km`}
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Estimated Arrival
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: hasArrived ? '#4ade80' : 'white' }}>
              {hasArrived ? 'Arrived!' : `~${remainingMins} mins`}
            </div>
          </div>
        </div>

        {/* Progress Bar along the bottom of the map */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          zIndex: 400,
        }}>
          <div style={{
            height: '100%',
            backgroundColor: hasArrived ? '#22c55e' : '#f97316',
            width: `${progress * 100}%`,
            transition: 'width 0.2s ease',
            boxShadow: '0 0 8px rgba(249, 115, 22, 0.8)',
          }} />
        </div>
      </div>

      {/* 4. Delivery Partner & Journey Info Footer */}
      <div style={{
        padding: '1.25rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderTop: '1px solid var(--border-color)',
      }}>
        {/* Rider Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            border: '2px solid #ea580c',
            flexShrink: 0,
          }}>
            👨‍🦱
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                {rider.name}
              </h4>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#fef3c7',
                color: '#b45309',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
              }}>
                ★ {rider.rating}
              </span>
            </div>
            <p style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {rider.vehicleNumber} • {rider.deliveriesCount}+ deliveries
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
              <ShieldCheck size={14} /> Sanitized & Temperature Verified (98.2°F)
            </div>
          </div>
        </div>

        {/* Contact & Handover OTP Details */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href={`tel:${rider.phone}`}
            className="btn btn-outline btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
            }}
          >
            <Phone size={15} /> Call {rider.name.split(' ')[0]}
          </a>

          <div style={{
            padding: '0.45rem 0.9rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Delivery PIN
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--charcoal)', letterSpacing: '1.5px' }}>
              {order?.deliveryPin || '4821'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .rider-radar-pulse {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background-color: #f97316;
          opacity: 0.35;
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
