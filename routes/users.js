const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Product, Order } = require('../services/db');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/users/recharge - Nạp Linh Thạch bằng mã xác nhận bảo mật cố định 666
router.post('/recharge', authenticate, async (req, res) => {
  try {
    const { amount, secretCode } = req.body;
    const numAmount = parseInt(amount, 10);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng Linh Thạch muốn nạp phải lớn hơn 0!'
      });
    }

    // Yêu cầu bắt buộc mã bảo mật 666 theo đặc tả
    if (String(secretCode).trim() !== '666') {
      return res.status(400).json({
        success: false,
        message: 'Mật mã bảo mật không chính xác! Vui lòng kiểm tra lại pháp ấn bảo mật tông môn.'
      });
    }

    // Cộng dồn Linh Thạch vào tài khoản
    req.user.linhThach = (req.user.linhThach || 0) + numAmount;
    await req.user.save();

    return res.json({
      success: true,
      message: `⚡ Thiên địa linh khí quy tụ! Đã nạp thành công ${numAmount.toLocaleString('vi-VN')} Linh Thạch vào đan điền!`,
      linhThach: req.user.linhThach
    });
  } catch (err) {
    console.error('Lỗi nạp linh thạch:', err);
    return res.status(500).json({
      success: false,
      message: 'Linh mạch bị nghẽn, không thể nạp Linh Thạch lúc này.'
    });
  }
});

// GET /api/users/wishlist - Lấy danh sách sản phẩm yêu thích của user
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const wishlistIds = req.user.wishlist || [];
    if (wishlistIds.length === 0) {
      return res.json({ success: true, items: [] });
    }

    const items = await Product.find({ _id: { $in: wishlistIds } }).populate('seller', 'name email dongPhu');
    return res.json({
      success: true,
      items
    });
  } catch (err) {
    console.error('Lỗi lấy wishlist:', err);
    return res.status(500).json({
      success: false,
      message: 'Không thể tra cứu danh sách yêu thích.'
    });
  }
});

// POST /api/users/wishlist/toggle - Thêm / Xóa bảo vật khỏi danh sách yêu thích
router.post('/wishlist/toggle', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã bảo vật.' });
    }

    let wishlist = req.user.wishlist || [];
    // Convert to string ids for comparison
    const strList = wishlist.map(id => (id && id._id ? id._id : id).toString());
    const targetId = productId.toString();
    const index = strList.indexOf(targetId);

    let isAdded = false;
    if (index >= 0) {
      // Remove
      wishlist.splice(index, 1);
      isAdded = false;
    } else {
      // Add
      wishlist.push(productId);
      isAdded = true;
    }

    req.user.wishlist = wishlist;
    await req.user.save();

    return res.json({
      success: true,
      isAdded,
      message: isAdded ? 'Đã khắc ghi vào tâm niệm (Thêm yêu thích)!' : 'Đã xóa khỏi tâm niệm.',
      wishlistCount: wishlist.length
    });
  } catch (err) {
    console.error('Lỗi toggle wishlist:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi thao tác bảo vật yêu thích.'
    });
  }
});

// ================= ADMIN MANAGEMENT ROUTES =================

// POST /api/users/admin/create-seller - Admin tạo tài khoản Seller cho 4 thành viên
router.post('/admin/create-seller', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, dongPhu, initialLinhThach } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đủ Đạo hiệu, Email và Mật khẩu cho Seller.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Truyền âm phù (Email) này đã tồn tại trong tông môn!'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'seller',
      linhThach: parseInt(initialLinhThach, 10) || 50000,
      dongPhu: (dongPhu && dongPhu.trim()) || 'Thần Luyện Động Phủ',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      wishlist: [],
      cart: []
    });

    return res.status(201).json({
      success: true,
      message: `Đã sắc phong thành công Động Chủ Seller [${seller.name}]!`,
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        dongPhu: seller.dongPhu,
        linhThach: seller.linhThach,
        createdAt: seller.createdAt
      }
    });
  } catch (err) {
    console.error('Lỗi tạo seller:', err);
    return res.status(500).json({
      success: false,
      message: 'Không thể sắc phong Seller mới.'
    });
  }
});

// GET /api/users/admin/sellers - Danh sách tất cả Sellers
router.get('/admin/sellers', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      sellers: sellers.map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        role: s.role,
        dongPhu: s.dongPhu || 'Thần Luyện Động Phủ',
        linhThach: s.linhThach,
        createdAt: s.createdAt
      }))
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách Seller.' });
  }
});

// GET /api/users/admin/stats - Tổng quan thống kê tông môn
router.get('/admin/stats', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const allUsers = await User.find({});
    const allProducts = await Product.find({});
    const allOrders = await Order.find({});

    const totalBuyers = allUsers.filter(u => u.role === 'buyer').length;
    const totalSellers = allUsers.filter(u => u.role === 'seller').length;
    const totalAdmins = allUsers.filter(u => u.role === 'admin').length;

    const totalLinhThachCirculating = allUsers.reduce((sum, u) => sum + (u.linhThach || 0), 0);
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalUsers: allUsers.length,
        totalBuyers,
        totalSellers,
        totalAdmins,
        totalProducts: allProducts.length,
        totalOrders: allOrders.length,
        totalRevenue,
        totalLinhThachCirculating
      },
      users: allUsers.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        dongPhu: u.dongPhu,
        linhThach: u.linhThach,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    console.error('Lỗi thống kê admin:', err);
    return res.status(500).json({ success: false, message: 'Lỗi lấy thống kê tông môn.' });
  }
});

module.exports = router;
