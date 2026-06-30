require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedDefaultAdmin } = require('./controllers/adminAuthController');

// Import routes
const adminAuthRoutes = require('./routes/adminAuth');
const vehicleRoutes = require('./routes/vehicles');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const contactRoutes = require('./routes/contacts');

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Voyago API is running.',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  Voyago API Server`);
    console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Port: ${PORT}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`========================================\n`);
  });
};

start();