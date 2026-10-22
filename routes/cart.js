const express = require('express');
const router = express.Router();
const { Product } = require('../services/db');
const { authenticate } = require('../middleware/auth');

// GET /api/cart - Lấy giỏ hàng của user
router.get('/', authenticate, async (req, res) => {
  try {
    const cart = req.user.cart || [];
    if (cart.length === 0) {
      return res.json({ success: true, items: [], totalAmount: 0 });
    }

    const productIds = cart.map(item => {
      return (item.product && item.product._id) ? item.product._id : item.product;
    });

    const products = await Product.find({ _id: { $in: productIds } }).populate('seller', 'name dongPhu');
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    let totalAmount = 0;
    const formattedItems = [];

    for (const item of cart) {
      const pId = ((item.product && item.product._id) ? item.product._id : item.product).toString();
      const product = productMap[pId];
      if (product) {
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        formattedItems.push({
          product,
          quantity: item.quantity,
          subtotal: itemTotal
        });
      }
    }

    return res.json({
      success: true,
      items: formattedItems,
      totalAmount,
      cartCount: formattedItems.reduce((sum, i) => sum + i.quantity, 0)
    });
  } catch (err) {
    console.error('Lỗi lấy giỏ hàng:', err);
    return res.status(500).json({ success: false, message: 'Lỗi truy vấn càn khôn đại (giỏ hàng).' });
  }
});

// POST /api/cart/add - Thêm bảo vật vào giỏ hàng
router.post('/add', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const addQty = Math.max(1, parseInt(quantity, 10));

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Bảo vật không tồn tại.' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Bảo vật đã hết hàng trong kho tàng!'
      });
    }

    let cart = req.user.cart || [];
    const pIdStr = productId.toString();
    const existingIndex = cart.findIndex(item => {
      const id = (item.product && item.product._id) ? item.product._id : item.product;
      return (id || '').toString() === pIdStr;
    });

    if (existingIndex >= 0) {
      const newQty = cart[existingIndex].quantity + addQty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Số lượng yêu cầu (${newQty}) vượt quá tồn kho hiện có (${product.stock})!`
        });
      }
      cart[existingIndex].quantity = newQty;
    } else {
      if (addQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Tồn kho chỉ còn ${product.stock} bảo vật!`
        });
      }
      cart.push({ product: product._id, quantity: addQty });
    }

    req.user.cart = cart;
    await req.user.save();

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({
      success: true,
      message: `Đã thu nạp [${product.name}] vào càn khôn đại!`,
      cartCount: totalCount
    });
  } catch (err) {
    console.error('Lỗi thêm vào giỏ:', err);
    return res.status(500).json({ success: false, message: 'Không thể thêm vào giỏ hàng.' });
  }
});

// PUT /api/cart/update - Cập nhật số lượng
router.put('/update', authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const newQty = parseInt(quantity, 10);
    const pIdStr = (productId || '').toString();

    let cart = req.user.cart || [];
    const index = cart.findIndex(item => {
      const id = (item.product && item.product._id) ? item.product._id : item.product;
      return (id || '').toString() === pIdStr;
    });

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Bảo vật không có trong giỏ hàng.' });
    }

    if (newQty <= 0) {
      cart.splice(index, 1);
    } else {
      const product = await Product.findById(productId);
      if (product && newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Kho tàng chỉ còn ${product.stock} bảo vật!`
        });
      }
      cart[index].quantity = newQty;
    }

    req.user.cart = cart;
    await req.user.save();

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({
      success: true,
      message: 'Đã cập nhật số lượng bảo vật!',
      cartCount: totalCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật giỏ hàng.' });
  }
});

// DELETE /api/cart/remove/:productId - Xóa bảo vật khỏi giỏ
router.delete('/remove/:productId', authenticate, async (req, res) => {
  try {
    const pIdStr = req.params.productId.toString();
    let cart = req.user.cart || [];

    req.user.cart = cart.filter(item => {
      const id = (item.product && item.product._id) ? item.product._id : item.product;
      return (id || '').toString() !== pIdStr;
    });

    await req.user.save();
    const totalCount = req.user.cart.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({
      success: true,
      message: 'Đã trả bảo vật về chỗ cũ.',
      cartCount: totalCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa khỏi giỏ hàng.' });
  }
});

// DELETE /api/cart/clear - Làm rỗng giỏ hàng
router.delete('/clear', authenticate, async (req, res) => {
  try {
    req.user.cart = [];
    await req.user.save();
    return res.json({
      success: true,
      message: 'Càn khôn đại đã trống trải.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi dọn giỏ hàng.' });
  }
});

module.exports = router;
