import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDemoData } from './scripts/seedDemoData.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Initialize Demo Catalog & Admin automatically on startup if empty
try {
  await seedDemoData();
} catch (err) {
  console.warn('⚠️ Demo seeding warning:', err.message);
}

const server = app.listen(PORT, () => {
  console.log(`
🍕 ========================================================
   FOODIEHUB — Your Cravings, Delivered Fresh
   Server Port:   ${PORT}
   Mode:          ${process.env.NODE_ENV || 'development'}
   API Base URL:  http://localhost:${PORT}/api/v1
   Health Check:  http://localhost:${PORT}/api/v1/health
   Admin Email:   ${process.env.ADMIN_EMAIL || 'admin@foodiehub.com'}
   Admin Pass:    ${process.env.ADMIN_PASSWORD || 'Admin@123456'}
======================================================== 🍔
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('FoodieHub HTTP server closed cleanly.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
