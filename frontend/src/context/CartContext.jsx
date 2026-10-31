import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('foodiehub_cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [restaurant, setRestaurant] = useState(() => {
    try {
      const stored = localStorage.getItem('foodiehub_cart_restaurant');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const stored = localStorage.getItem('foodiehub_cart_coupon');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Conflict modal state when adding from another restaurant
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    newFood: null,
    newRestaurant: null,
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('foodiehub_cart_items', JSON.stringify(items));
    if (items.length === 0) {
      setRestaurant(null);
      localStorage.removeItem('foodiehub_cart_restaurant');
    } else {
      localStorage.setItem('foodiehub_cart_restaurant', JSON.stringify(restaurant));
    }
  }, [items, restaurant]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('foodiehub_cart_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('foodiehub_cart_coupon');
    }
  }, [coupon]);

  const addToCart = (food, quantity = 1, foodRestaurant = null, forceReplace = false) => {
    const foodRestId =
      food.restaurantId?._id || food.restaurantId || foodRestaurant?._id || null;
    const foodRestName =
      food.restaurantId?.name || foodRestaurant?.name || 'Restaurant';

    // Check single-restaurant restriction
    if (
      restaurant &&
      items.length > 0 &&
      foodRestId &&
      restaurant._id !== foodRestId
    ) {
      if (!forceReplace) {
        setConflictModal({
          isOpen: true,
          newFood: food,
          newRestaurant: { _id: foodRestId, name: foodRestName },
        });
        return false;
      }
      // Force replace existing cart
      setItems([
        {
          foodId: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          isVegetarian: food.isVegetarian,
          quantity: Number(quantity),
        },
      ]);
      setRestaurant({ _id: foodRestId, name: foodRestName });
      setConflictModal({ isOpen: false, newFood: null, newRestaurant: null });
      return true;
    }

    // Set restaurant if first item
    if (!restaurant && foodRestId) {
      setRestaurant({ _id: foodRestId, name: foodRestName });
    }

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((i) => i.foodId === food._id);
      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += Number(quantity);
        return updated;
      }
      return [
        ...prevItems,
        {
          foodId: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          isVegetarian: food.isVegetarian,
          quantity: Number(quantity),
        },
      ];
    });

    return true;
  };

  const updateQuantity = (foodId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.foodId === foodId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (foodId) => {
    setItems((prev) => prev.filter((item) => item.foodId !== foodId));
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
    setCoupon(null);
    localStorage.removeItem('foodiehub_cart_items');
    localStorage.removeItem('foodiehub_cart_restaurant');
    localStorage.removeItem('foodiehub_cart_coupon');
  };

  // Pricing calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = items.length === 0 ? 0 : subtotal >= 500 ? 0 : 40;

  // Coupon discount calculation
  let discount = 0;
  if (coupon && subtotal >= (coupon.minimumOrderValue || 0)) {
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue || 0;
    }
    if (discount > subtotal) discount = subtotal;
  }

  const tax = items.length === 0 ? 0 : Math.round((subtotal - discount) * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal + deliveryFee + tax - discount);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCouponCode = async (code) => {
    try {
      const res = await api.post('/coupons/validate', {
        code,
        subtotal,
      });
      if (res.data.success) {
        setCoupon(res.data.coupon);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid coupon code',
      };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        restaurant,
        coupon,
        subtotal,
        deliveryFee,
        tax,
        discount,
        grandTotal,
        totalItemsCount,
        conflictModal,
        setConflictModal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
