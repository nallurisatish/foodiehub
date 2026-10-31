import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';
import { memoryStore } from '../utils/dataStore.js';

export const seedAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@foodiehub.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'FoodieHub Admin';

  try {
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: adminEmail });
      if (existing) {
        console.log(`ℹ️ Admin user (${adminEmail}) already exists.`);
        return existing;
      }

      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash: adminPassword, // Pre-save hook hashes it
        role: 'admin',
        phone: '+91 98765 43210',
      });

      console.log(`✅ Administrator created successfully: ${adminEmail}`);
      return admin;
    } else {
      let existing = memoryStore.users.find((u) => u.email === adminEmail);
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        existing = {
          _id: new mongoose.Types.ObjectId().toString(),
          name: adminName,
          email: adminEmail,
          passwordHash,
          role: 'admin',
          phone: '+91 98765 43210',
          addresses: [],
          createdAt: new Date(),
        };
        memoryStore.users.push(existing);
        console.log(`✅ In-memory Administrator created: ${adminEmail} / ${adminPassword}`);
      }
      return existing;
    }
  } catch (error) {
    console.error('❌ Error seeding administrator:', error.message);
  }
};

// If run directly via command line
if (process.argv[1]?.endsWith('seedAdmin.js')) {
  await connectDB();
  await seedAdmin();
  process.exit(0);
}
