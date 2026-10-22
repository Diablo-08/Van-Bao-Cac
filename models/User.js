const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên đạo hữu không được để trống'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Truyền âm phù (Email) không được để trống'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu bảo mật không được để trống']
  },
  role: {
    type: String,
    enum: ['admin', 'seller', 'buyer'],
    default: 'buyer'
  },
  linhThach: {
    type: Number,
    default: 1000,
    min: 0
  },
  dongPhu: {
    type: String,
    default: 'Thanh Vân Động Phủ'
  },
  avatar: {
    type: String,
    default: ''
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [cartItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
