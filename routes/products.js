const express = require('express');
const router = express.Router();
const { Product, User } = require('../services/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Định nghĩa 4 danh mục chính theo đặc tả
const CATEGORIES = [
  {
    id: 'cong-phap',
    name: 'Công Pháp & Bí Tịch',
    description: 'Vô thượng huyền công khai phá kinh mạch, ngự kiếm thông thiên',
    icon: 'fa-book-skull',
    bgGradient: 'from-amber-950/40 to-slate-900'
  },
  {
    id: 'dan-duoc',
    name: 'Đan Dược & Linh Thảo',
    description: 'Luyện đan nghịch thiên cải mệnh, ngàn năm kỳ hoa dị thảo',
    icon: 'fa-mortar-pestle',
    bgGradient: 'from-emerald-950/40 to-slate-900'
  },
  {
    id: 'phap-bao',
    name: 'Pháp Bảo & Binh Khí',
    description: 'Thần binh lợi khí phong lôi chấn thế, vạn kiếm quy tông',
    icon: 'fa-wand-magic-sparkles',
    bgGradient: 'from-blue-950/40 to-slate-900'
  },
  {
    id: 'linh-vat',
    name: 'Bảo Khố Tạp Vật',
    description: 'Hành trang tu tiên, linh thú hộ đạo cùng vô số kỳ trân dị vật độc bá.',
    icon: 'fa-dragon',
    bgGradient: 'from-purple-950/40 to-slate-900'
  }
];

// GET /api/products/categories - Lấy danh sách 4 danh mục chính
router.get('/categories', (req, res) => {
  return res.json({
    success: true,
    categories: CATEGORIES
  });
});

// GET /api/products/featured-by-category - Lấy 5 sản phẩm nổi bật cho mỗi danh mục
router.get('/featured-by-category', async (req, res) => {
  try {
    const result = {};

    for (const cat of CATEGORIES) {
      const items = await Product.find({ category: cat.id })
        .populate('seller', 'name email dongPhu')
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(5);

      result[cat.id] = {
        categoryInfo: cat,
        products: items
      };
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Lỗi lấy sản phẩm nổi bật:', err);
    return res.status(500).json({ success: false, message: 'Lỗi truy vấn bảo vật nổi bật.' });
  }
});

// GET /api/products - Danh sách sản phẩm với bộ lọc danh mục, phân mục (subCategory), phẩm cấp, từ khóa
router.get('/', async (req, res) => {
  try {
    const { category, subCategory, grade, search, sellerId, limit = 200, skip = 0, sort = 'newest' } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (subCategory && subCategory !== 'all') {
      query.subCategory = subCategory;
    }

    if (grade && grade !== 'all') {
      query.grade = grade;
    }

    if (sellerId) {
      query.seller = sellerId;
    }

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'stock_desc') sortObj = { stock: -1 };

    const products = await Product.find(query)
      .populate('seller', 'name email dongPhu')
      .sort(sortObj)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    return res.json({
      success: true,
      total,
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Lỗi tra cứu sản phẩm:', err);
    return res.status(500).json({ success: false, message: 'Không thể khám phá bảo vật.' });
  }
});

// GET /api/products/seller/my-products - Seller xem danh sách bảo vật của mình (Admin xem toàn bộ để quản lý)
router.get('/seller/my-products', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { seller: req.user._id };
    const products = await Product.find(filter).populate('seller', 'name email dongPhu').sort({ createdAt: -1 });
    return res.json({
      success: true,
      products
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi tra cứu kho bảo vật của Seller.' });
  }
});

// GET /api/products/:id - Chi tiết sản phẩm (PDP)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Bảo vật này không tồn tại trong nhân gian.' });
    }
    await product.populate('seller', 'name email dongPhu');

    return res.json({
      success: true,
      product
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi tra cứu chi tiết bảo vật.' });
  }
});

async function resolveSellerCategory(user) {
  if (!user || user.role === 'admin') return null;
  const email = (user.email || '').toLowerCase();
  const dongPhu = (user.dongPhu || '').toLowerCase();
  if (email.includes('congphap') || dongPhu.includes('thiên thư') || dongPhu.includes('thien thu')) return 'cong-phap';
  if (email.includes('danduoc') || dongPhu.includes('bách thảo') || dongPhu.includes('bach thao')) return 'dan-duoc';
  if (email.includes('phapbao') || dongPhu.includes('vạn kiếm') || dongPhu.includes('van kiem')) return 'phap-bao';
  if (email.includes('linhvat') || dongPhu.includes('vạn thú') || dongPhu.includes('van thu')) return 'linh-vat';

  const existingProduct = await Product.findOne({ seller: user._id });
  if (existingProduct) return existingProduct.category;
  return null;
}

// POST /api/products - Seller / Admin đăng bán sản phẩm mới
router.post('/', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const { name, description, lore, price, category, subCategory, subType, grade, stock, image, isFeatured } = req.body;

    if (!name || !description || !price || !category || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đủ Tên bảo vật, Mô tả công hiệu, Giá Linh Thạch, Danh mục và Phẩm cấp.'
      });
    }

    const validGrades = ['Hoang', 'Huyen', 'Dia', 'Thien', 'Tien'];
    if (!validGrades.includes(grade)) {
      return res.status(400).json({
        success: false,
        message: 'Phẩm cấp phải là một trong: Hoàng (Hoang), Huyền (Huyen), Địa (Dia), Thiên (Thien).'
      });
    }

    const validCats = ['cong-phap', 'dan-duoc', 'phap-bao', 'linh-vat'];
    if (!validCats.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Danh mục không hợp lệ.'
      });
    }

    // Đảm bảo Seller chỉ thêm được hàng thuộc danh mục của mình (Admin có thể thêm ở mọi danh mục)
    if (req.user.role === 'seller') {
      const allowedCat = await resolveSellerCategory(req.user);
      if (allowedCat && category !== allowedCat) {
        return res.status(403).json({
          success: false,
          message: 'Đạo hữu chỉ được phép niêm yết bảo vật thuộc danh mục quản lý của động phủ mình!'
        });
      }
    }

    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      lore: (lore && lore.trim()) || 'Bảo vật do đại sư dày công rèn đúc, ẩn chứa linh khí tinh thuần.',
      price: Math.max(1, parseInt(price, 10)),
      category,
      subCategory: (subCategory && subCategory.trim()) || '',
      subType: (subType && subType.trim()) || '',
      grade: grade === 'Tien' ? 'Thien' : grade,
      stock: Math.max(0, parseInt(stock, 10) || 10),
      seller: req.user._id,
      image: (image && image.trim()) || '',
      isFeatured: Boolean(isFeatured)
    });

    return res.status(201).json({
      success: true,
      message: `Đã đưa bảo vật [${newProduct.name}] lên giá bán thành công!`,
      product: newProduct
    });
  } catch (err) {
    console.error('Lỗi thêm sản phẩm:', err);
    return res.status(500).json({ success: false, message: 'Không thể niêm yết bảo vật.' });
  }
});

// PUT /api/products/:id - Seller / Admin cập nhật sản phẩm
router.put('/:id', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bảo vật cần sửa.' });
    }

    // Nếu là seller, chỉ được sửa sản phẩm của chính mình (Admin được sửa tất cả)
    const sellerId = product.seller && product.seller._id ? product.seller._id : product.seller;
    if (req.user.role !== 'admin' && (sellerId || '').toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Đạo hữu không có quyền chỉnh sửa bảo vật của động phủ khác!' });
    }

    const { name, description, lore, price, category, subCategory, subType, grade, stock, image, isFeatured } = req.body;
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (lore !== undefined) product.lore = lore;
    if (price !== undefined) product.price = Math.max(1, parseInt(price, 10));

    // Kiểm tra danh mục nếu seller thay đổi
    if (category && category !== product.category) {
      if (req.user.role === 'seller') {
        const allowedCat = await resolveSellerCategory(req.user);
        if (allowedCat && category !== allowedCat) {
          return res.status(403).json({
            success: false,
            message: 'Đạo hữu chỉ được phép quản lý bảo vật thuộc danh mục của động phủ mình!'
          });
        }
      }
      product.category = category;
    }

    if (subCategory !== undefined) product.subCategory = subCategory.trim();
    if (subType !== undefined) product.subType = subType.trim();
    if (grade) product.grade = grade;
    if (stock !== undefined) product.stock = Math.max(0, parseInt(stock, 10));
    if (image !== undefined) product.image = image.trim();
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);

    await product.save();

    return res.json({
      success: true,
      message: `Đã cập nhật công hiệu bảo vật [${product.name}]!`,
      product
    });
  } catch (err) {
    console.error('Lỗi cập nhật sản phẩm:', err);
    return res.status(500).json({ success: false, message: 'Không thể tu sửa bảo vật.' });
  }
});

// DELETE /api/products/:id - Seller / Admin xóa sản phẩm
router.delete('/:id', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bảo vật.' });
    }

    const sellerId = product.seller && product.seller._id ? product.seller._id : product.seller;
    if (req.user.role !== 'admin' && (sellerId || '').toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Đạo hữu không thể hủy niêm yết bảo vật của động phủ khác!' });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: `Đã thu hồi bảo vật [${product.name}] khỏi giá bán!`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi thu hồi bảo vật.' });
  }
});

module.exports = router;
