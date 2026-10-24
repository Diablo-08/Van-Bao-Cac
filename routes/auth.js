const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../services/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register - Chỉ đăng ký tài khoản Buyer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, dongPhu } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ Đạo hiệu (Tên), Truyền âm phù (Email) và Mật khẩu.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật mã tu vi cần ít nhất 6 ký tự để bảo hộ thần thức.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Truyền âm phù này đã được một vị đạo hữu khác đăng ký.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'buyer', // Luôn mặc định là Buyer theo tài liệu đặc tả
      linhThach: 1000, // Mặc định 1000 Linh Thạch khi gia nhập giới tu tiên
      dongPhu: (dongPhu && dongPhu.trim()) || 'Thanh Vân Động Phủ',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      wishlist: [],
      cart: []
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('vbc_token', token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Chúc mừng đạo hữu đã chính thức bước vào Vạn Bảo Các!',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        linhThach: newUser.linhThach,
        dongPhu: newUser.dongPhu,
        avatar: newUser.avatar,
        wishlistCount: 0,
        cartCount: 0
      }
    });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    return res.status(500).json({
      success: false,
      message: 'Thiên địa linh khí rối loạn, đăng ký thất bại. Xin thử lại sau.'
    });
  }
});

// POST /api/auth/login - Đăng nhập bằng Tên đăng nhập (Đạo hiệu) HOẶC Email
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginInput = (identifier || email || username || '').trim();

    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập Tên đăng nhập (hoặc Email) và Mật khẩu.'
      });
    }

    // Tra cứu theo Tên đăng nhập (Đạo hiệu) HOẶC Truyền âm phù (Email)
    const user = await User.findOne({
      $or: [
        { email: loginInput.toLowerCase() },
        { name: loginInput }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy tài khoản hoặc đạo hiệu này trong Vạn Bảo Các.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật mã bảo mật không chính xác!'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('vbc_token', token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const cartCount = Array.isArray(user.cart)
      ? user.cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
      : 0;
    const wishlistCount = Array.isArray(user.wishlist) ? user.wishlist.length : 0;

    return res.json({
      success: true,
      message: `Chào mừng ${user.name} trở lại Vạn Bảo Các!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        linhThach: user.linhThach,
        dongPhu: user.dongPhu || 'Thanh Vân Động Phủ',
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`,
        wishlistCount,
        cartCount
      }
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    return res.status(500).json({
      success: false,
      message: 'Không thể kết nối linh thần, đăng nhập thất bại.'
    });
  }
});

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const cartCount = Array.isArray(user.cart)
      ? user.cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
      : 0;
    const wishlistCount = Array.isArray(user.wishlist) ? user.wishlist.length : 0;

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        linhThach: user.linhThach,
        dongPhu: user.dongPhu || 'Thanh Vân Động Phủ',
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`,
        wishlistCount,
        cartCount
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin tu sĩ.'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('vbc_token');
  return res.json({
    success: true,
    message: 'Đã bế quan xuất trần (Đăng xuất thành công).'
  });
});

// PUT /api/auth/avatar - Cập nhật avatar (Pháp tướng)
router.put('/avatar', authenticate, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar || !avatar.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp liên kết ảnh pháp tướng (URL)!' });
    }

    req.user.avatar = avatar.trim();
    await req.user.save();

    return res.json({
      success: true,
      message: 'Thiên biến vạn hóa! Pháp tướng (Avatar) đã được cập nhật thành công!',
      avatar: req.user.avatar
    });
  } catch (err) {
    console.error('Lỗi cập nhật avatar:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật pháp tướng.' });
  }
});

// PUT /api/auth/change-password - Đổi mật khẩu tu luyện
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ mật khẩu hiện tại và mật khẩu mới.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự để bảo hộ thần thức.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác! Không thể giải trừ phong ấn.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    req.user.password = hashedPassword;
    await req.user.save();

    return res.json({
      success: true,
      message: 'Khóa ấn tâm pháp đã được tái tạo! Đổi mật khẩu thành công.'
    });
  } catch (err) {
    console.error('Lỗi đổi mật khẩu:', err);
    return res.status(500).json({ success: false, message: 'Lỗi đổi mật khẩu.' });
  }
});

module.exports = router;
