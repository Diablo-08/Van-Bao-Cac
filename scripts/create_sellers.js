require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas...');

  const sellersConfig = [
    {
      category: 'cong-phap',
      categoryName: 'Công Pháp & Bí Tịch',
      name: 'Thiên Thư Các Chủ',
      email: 'congphap@vanbaocac.com',
      password: 'seller123',
      dongPhu: 'Thiên Thư Các'
    },
    {
      category: 'dan-duoc',
      categoryName: 'Đan Dược & Linh Thảo',
      name: 'Bách Thảo Đan Vương',
      email: 'danduoc@vanbaocac.com',
      password: 'seller123',
      dongPhu: 'Bách Thảo Đan Các'
    },
    {
      category: 'phap-bao',
      categoryName: 'Pháp Bảo & Binh Khí',
      name: 'Vạn Kiếm Tông Chủ',
      email: 'phapbao@vanbaocac.com',
      password: 'seller123',
      dongPhu: 'Vạn Kiếm Luyện Khí Phủ'
    },
    {
      category: 'linh-vat',
      categoryName: 'Linh Vật',
      name: 'Vạn Thú Trang Chủ',
      email: 'linhvat@vanbaocac.com',
      password: 'seller123',
      dongPhu: 'Vạn Thú Sơn Trang'
    }
  ];

  for (const cfg of sellersConfig) {
    let user = await User.findOne({ email: cfg.email });
    const hashedPassword = await bcrypt.hash(cfg.password, 10);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cfg.name)}`;

    if (user) {
      user.name = cfg.name;
      user.password = hashedPassword;
      user.role = 'seller';
      user.dongPhu = cfg.dongPhu;
      user.linhThach = 50000;
      user.avatar = avatar;
      await user.save();
      console.log(`Updated Seller: ${cfg.name} (${cfg.email})`);
    } else {
      user = await User.create({
        name: cfg.name,
        email: cfg.email,
        password: hashedPassword,
        role: 'seller',
        dongPhu: cfg.dongPhu,
        linhThach: 50000,
        avatar: avatar
      });
      console.log(`Created Seller: ${cfg.name} (${cfg.email})`);
    }

    // Reassign all products in this category to this seller
    const updateResult = await Product.updateMany(
      { category: cfg.category },
      { $set: { seller: user._id } }
    );
    console.log(`  -> Assigned ${updateResult.modifiedCount} products in category [${cfg.category}] to seller ${cfg.name}`);
  }

  console.log('All 4 Sellers created and products reassigned successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error creating sellers:', err);
  process.exit(1);
});
