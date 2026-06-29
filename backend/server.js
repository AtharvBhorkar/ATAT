require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const { seedDefaultAdmin } = require('./controllers/adminAuthController');

// Routes
const adminAuthRoutes = require('./routes/adminAuth');
const vehicleRoutes = require('./routes/vehicles');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const contactRoutes = require('./routes/contacts');

// App init
const app = express();

/* ───────────────────────────────
   MIDDLEWARE
─────────────────────────────── */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ───────────────────────────────
   DEV LOGGING
─────────────────────────────── */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

/* ───────────────────────────────
   HEALTH CHECK
─────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Voyago API is running.',
    timestamp: new Date().toISOString()
  });
});

/* ───────────────────────────────
   ADMIN PAGES (IMPORTANT ORDER)
─────────────────────────────── */
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
});

// FIX: prevent refresh 404 issue
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
});

/* ───────────────────────────────
   API ROUTES
─────────────────────────────── */
app.use('/api/admin', adminAuthRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.path} not found.`
  });
});

/* ───────────────────────────────
   GLOBAL ERROR HANDLER
─────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/* ───────────────────────────────
   START SERVER
─────────────────────────────── */
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    await seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('  Voyago Server Running');
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Admin: http://localhost:${PORT}/admin`);
      console.log('========================================\n');
    });

  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

start();