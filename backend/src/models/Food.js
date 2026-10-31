import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Food item name is required'], trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price in INR is required'], min: 0 },
    image: { type: String, required: [true, 'Food image is required'] },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Breakfast',
        'Starters',
        'Biryani',
        'Indian Meals',
        'Pizza',
        'Burgers',
        'Chinese',
        'Desserts',
        'Beverages',
      ],
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Associated restaurant is required'],
    },
    isVegetarian: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: String, default: '20-25 mins' },
    tags: [{ type: String }],
    rating: { type: Number, default: 4.7, min: 1, max: 5 },
    ratingCount: { type: Number, default: 85 },
    bestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', category: 'text' });
foodSchema.index({ restaurantId: 1, category: 1 });

export const Food = mongoose.model('Food', foodSchema);
