require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 🚨 CHECK JWT_SECRET IMMEDIATELY
if (!process.env.JWT_SECRET) {
  console.error('\n❌ FATAL ERROR:');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('JWT_SECRET is not defined in your .env file');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('\n📝 Add this to your .env file:\n');
  console.error('   JWT_SECRET=voyago_secret_key_12345\n');
  console.error('Then restart the server.\n');
  process.exit(1);
}

console.log('✓ JWT_SECRET is configured');

const connectDB = require('./config/db');
const { seedDefaultAdmin } = require('./controllers/adminAuthController');

// Routes
const adminAuthRoutes = require('./routes/adminAuth');
const vehicleRoutes = require('./routes/vehicles');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const contactRoutes = require('./routes/contacts');
const publicApiRoutes = require('./routes/publicApi');
const paymentRoutes = require('./routes/payments');
const settingsRoutes = require('./routes/settings');
const userRoutes = require('./routes/userRoutes');

// Ensure upload directories exist
const dirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'vehicles'),
  path.join(__dirname, 'uploads', 'packages'),
  path.join(__dirname, 'uploads', 'temp'),
];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ✅ CREATE EXPRESS APP FIRST
const app = express();

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ SERVE UPLOADED IMAGES AS STATIC FILES
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

// Optional fallback if you also keep uploads outside backend
const altUploadPath = path.join(__dirname, '../uploads');
if (fs.existsSync(altUploadPath)) {
  app.use('/uploads', express.static(altUploadPath));
}

// Dev logging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Static frontend
app.use(express.static(path.join(__dirname, '../frontend'), { index: false }));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.redirect('/');
});

// Admin pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Voyago API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/public', publicApiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/human', userRoutes);

// Ignore Chrome devtools file
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    console.log('✓ Database connected');

    await seedDefaultAdmin();
    console.log('✓ Default admin checked/seeded');

    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('  Voyago Server Running');
      console.log(`  Port: ${PORT}`);
      console.log(`  Home: http://localhost:${PORT}`);
      console.log(`  Admin Login: http://localhost:${PORT}/admin`);
      console.log(`  Admin Dashboard: http://localhost:${PORT}/admin/dashboard`);
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

start();