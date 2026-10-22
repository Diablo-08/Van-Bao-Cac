const jwt = require('jsonwebtoken');
const { User } = require('../services/db');

const JWT_SECRET = process.env.JWT_SECRET || 'van_bao_cac_huyen_ao_tam_phap_2026';

async function authenticate(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.vbc_token) {
      token = req.cookies.vbc_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xuất trình lệnh bài thông hành (Chưa đăng nhập).'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Thần hồn không tồn tại hoặc đã phi thăng. Vui lòng đăng nhập lại.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Lệnh bài thông hành không hợp lệ hoặc đã hết hạn.'
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Cần đăng nhập để sử dụng tính năng này.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Quyền hạn bất túc! Cần thân phận [${allowedRoles.join(' hoặc ')}] để mở phong ấn này.`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET
};
