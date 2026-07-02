// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const path = require('path');

// const connectDB = require('./config/db');
// const { seedDefaultAdmin } = require('./controllers/adminAuthController');

// // Routes
// const adminAuthRoutes = require('./routes/adminAuth');
// const vehicleRoutes = require('./routes/vehicles');
// const packageRoutes = require('./routes/packages');
// const bookingRoutes = require('./routes/bookings');
// const contactRoutes = require('./routes/contacts');
// const publicApiRoutes = require('./routes/publicApi');
// const paymentRoutes = require('./routes/payments');
// const settingsRoutes = require('./routes/settings');

// const app = express();

// /* ───────────────────────────────
//    CORS
// ─────────────────────────────── */
// app.use(
//   cors({
//     origin: [
//       'http://localhost:3000',
//       'http://localhost:5173',
//       'http://localhost:5500',
//       'http://127.0.0.1:5500'
//     ],
//     credentials: true
//   })
// );

// /* ───────────────────────────────
//    MIDDLEWARE
// ─────────────────────────────── */
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// /* ───────────────────────────────
//    DEV LOGGING
// ─────────────────────────────── */
// if (process.env.NODE_ENV === 'development') {
//   app.use((req, res, next) => {
//     console.log(`${req.method} ${req.path}`);
//     next();
//   });
// }

// /* ───────────────────────────────
//    STATIC FRONTEND
// ─────────────────────────────── */
// app.use(express.static(path.join(__dirname, '../frontend'), { index: false }));

// /* ───────────────────────────────
//    ROOT → HOME PAGE
// ─────────────────────────────── */
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// /* ───────────────────────────────
//    HEALTH CHECK
// ─────────────────────────────── */
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Voyago API is running',
//     timestamp: new Date().toISOString()
//   });
// });

// /* ───────────────────────────────
//    ADMIN PAGES
// ─────────────────────────────── */
// app.get('/admin', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
// });

// app.get('/admin/dashboard', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
// });

// /* ───────────────────────────────
//    SPA REFRESH FIX FOR ADMIN
//    If user refreshes /admin/something, serve dashboard HTML
//    but do NOT hijack JS/CSS/image requests
// ─────────────────────────────── */
// app.get('/admin/*', (req, res, next) => {
//   const staticFilePattern =
//     /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|map)$/i;

//   if (staticFilePattern.test(req.path)) {
//     return next();
//   }

//   return res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
// });

// /* ───────────────────────────────
//    API ROUTES
// ─────────────────────────────── */
// app.use('/api/admin', adminAuthRoutes);
// app.use('/api/vehicles', vehicleRoutes);
// app.use('/api/packages', packageRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/contacts', contactRoutes);
// app.use('/api/public', publicApiRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/settings', settingsRoutes);

// /* ───────────────────────────────
//    404 HANDLER
// ─────────────────────────────── */
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.path} not found`
//   });
// });

// /* ───────────────────────────────
//    GLOBAL ERROR HANDLER
// ─────────────────────────────── */
// app.use((err, req, res, next) => {
//   console.error(err);

//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

// /* ───────────────────────────────
//    START SERVER
// ─────────────────────────────── */
// const PORT = process.env.PORT || 5000;

// const start = async () => {
//   try {
//     await connectDB();
//     await seedDefaultAdmin();

//     app.listen(PORT, () => {
//       console.log('\n========================================');
//       console.log('  Voyago Server Running');
//       console.log(`  Port: ${PORT}`);
//       console.log(`  Home: http://localhost:${PORT}`);
//       console.log(`  Admin: http://localhost:${PORT}/admin`);
//       console.log('========================================\n');
//     });
//   } catch (error) {
//     console.error('Server startup failed:', error);
//     process.exit(1);
//   }
// };

// start();

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
const publicApiRoutes = require('./routes/publicApi');
const paymentRoutes = require('./routes/payments');
const settingsRoutes = require('./routes/settings');
const userRoutes = require('./routes/userRoutes');

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
      'http://127.0.0.1:5000'
    ],
    credentials: true
  })
);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
    timestamp: new Date().toISOString()
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
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await seedDefaultAdmin();

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