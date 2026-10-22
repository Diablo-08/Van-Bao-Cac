const express = require('express');
const router = express.Router();
const { Product, Order, User } = require('../services/db');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/orders/checkout - Thanh toán toàn bộ giỏ hàng bằng Linh Thạch
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const cart = user.cart || [];

    if (cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Càn khôn đại (giỏ hàng) đang trống, chưa có bảo vật nào để thanh toán!'
      });
    }

    // Lấy thông tin các sản phẩm trong giỏ
    const productIds = cart.map(item => (item.product && item.product._id) ? item.product._id : item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    let totalAmount = 0;
    const orderItems = [];

    // Kiểm tra tính hợp lệ và tồn kho
    for (const item of cart) {
      const pIdStr = ((item.product && item.product._id) ? item.product._id : item.product).toString();
      const product = productMap[pIdStr];

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Một bảo vật trong giỏ không còn tồn tại!`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Bảo vật [${product.name}] hiện chỉ còn ${product.stock} món trong kho (bạn đặt ${item.quantity}). Vui lòng điều chỉnh số lượng!`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        grade: product.grade,
        category: product.category,
        quantity: item.quantity,
        seller: product.seller,
        image: product.image || ''
      });
    }

    // KIỂM TRA SỐ DƯ LINH THẠCH
    if ((user.linhThach || 0) < totalAmount) {
      const shortage = totalAmount - (user.linhThach || 0);
      return res.status(400).json({
        success: false,
        notEnoughLinhThach: true,
        currentBalance: user.linhThach || 0,
        requiredAmount: totalAmount,
        shortage,
        message: 'Linh thạch không đủ!'
      });
    }

    // 1. Trừ tiền Linh Thạch của Buyer
    user.linhThach -= totalAmount;
    user.cart = []; // Làm trống giỏ hàng sau khi mua thành công
    await user.save();

    // 2. Trừ tồn kho và cộng tiền cho các Seller
    for (const item of cart) {
      const pIdStr = ((item.product && item.product._id) ? item.product._id : item.product).toString();
      const product = productMap[pIdStr];
      product.stock -= item.quantity;
      await product.save();

      // Cộng linh thạch tương ứng cho Seller của món hàng
      const sellerId = (product.seller && product.seller._id) ? product.seller._id : product.seller;
      if (sellerId) {
        const sellerUser = await User.findById(sellerId);
        if (sellerUser) {
          sellerUser.linhThach = (sellerUser.linhThach || 0) + (product.price * item.quantity);
          await sellerUser.save();
        }
      }
    }

    // 3. Tạo bản ghi Đơn Hàng (Order)
    const newOrder = await Order.create({
      buyer: user._id,
      items: orderItems,
      totalAmount,
      status: 'Thành công (Đã chuyển đến động phủ)'
    });

    // 4. Trả về đúng thông điệp theo đặc tả
    return res.status(201).json({
      success: true,
      message: 'Thanh toán thành công! Bảo vật đã được chuyển đến động phủ của đạo sĩ.',
      order: newOrder,
      newBalance: user.linhThach
    });
  } catch (err) {
    console.error('Lỗi thanh toán đơn hàng:', err);
    return res.status(500).json({
      success: false,
      message: 'Pháp trận giao dịch gặp trục trặc, thanh toán chưa hoàn tất.'
    });
  }
});

// GET /api/orders/my-orders - Xem lịch sử mua bảo vật của buyer
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name image grade price category')
      .sort({ createdAt: -1 });
    return res.json({
      success: true,
      orders
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi tra cứu lịch sử mua bảo vật.' });
  }
});

// GET /api/orders/seller-orders - Seller xem các bảo vật mình đã bán
router.get('/seller-orders', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const allOrders = await Order.find({}).sort({ createdAt: -1 });
    const mySales = [];
    const sellerIdStr = req.user._id.toString();

    allOrders.forEach(ord => {
      const matchedItems = (ord.items || []).filter(item => {
        const sId = (item.seller && item.seller._id) ? item.seller._id : item.seller;
        return req.user.role === 'admin' || (sId || '').toString() === sellerIdStr;
      });

      if (matchedItems.length > 0) {
        mySales.push({
          orderId: ord._id,
          createdAt: ord.createdAt,
          status: ord.status,
          buyer: ord.buyer,
          items: matchedItems,
          totalEarned: matchedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        });
      }
    });

    return res.json({
      success: true,
      sales: mySales
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách bán bảo vật.' });
  }
});

module.exports = router;
