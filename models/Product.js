const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên bảo vật không được để trống'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Mô tả công hiệu không được để trống']
  },
  lore: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Giá Linh Thạch không được để trống'],
    min: 1
  },
  category: {
    type: String,
    required: [true, 'Danh mục không được để trống'],
    enum: ['cong-phap', 'dan-duoc', 'phap-bao', 'linh-vat']
  },
  subCategory: {
    type: String,
    default: ''
  },
  subType: {
    type: String,
    default: ''
  },
  grade: {
    type: String,
    required: [true, 'Phẩm cấp bảo vật không được để trống'],
    enum: ['Hoang', 'Huyen', 'Dia', 'Thien', 'Tien']
  },
  stock: {
    type: Number,
    required: [true, 'Số lượng tồn kho không được để trống'],
    min: 0,
    default: 10
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
