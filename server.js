require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB, User } = require('./services/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đảm bảo mã hóa UTF-8 cho toàn bộ phản hồi
app.use((req, res, next) => {
  res.setHeader('Charset', 'utf-8');
  next();
});

// Static files với mã hóa UTF-8 tường minh
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    }
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    system: 'Vạn Bảo Các',
    time: new Date().toISOString()
  });
});

// Single Page Application fallback / 404 handler
app.use((req, res) => {
  // If API route not found, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Đạo hữu đi lạc vào cấm địa (API 404).' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function startServer() {
  try {
    await connectDB();

    // Check if seeding is needed
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('⚡ Chưa có dữ liệu tu tiên, tự động khởi tạo Vạn Bảo Các...');
      const runSeed = require('./seed');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🌿 VẠN BẢO CÁC (Thương Mại Điện Tử Tu Tiên Đa Bên)`);
      console.log(`🚀 Cổng giao thương đã khai mở tại: http://localhost:${PORT}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('❌ Lỗi khởi động Vạn Bảo Các:', err);
  }
}

startServer();
