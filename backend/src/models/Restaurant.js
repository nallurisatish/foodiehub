import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Restaurant name is required'], trim: true },
    description: { type: String, default: '' },
    cuisineTypes: [{ type: String, trim: true }],
    image: { type: String, required: true },
    address: {
      doorNo: { type: String, default: '' },
      street: { type: String, default: '' },
      locality: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      pincode: { type: String, default: '' },
    },
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
    },
    googleMapsUrl: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    ratingCount: { type: Number, default: 150 },
    deliveryFee: { type: Number, default: 40, min: 0 },
    estimatedDeliveryTime: { type: String, default: '30-40 min' },
    distance: { type: String, default: '2.4 km' },
    isOpen: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    priceForTwo: { type: Number, default: 400 },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisineTypes: 'text' });

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
