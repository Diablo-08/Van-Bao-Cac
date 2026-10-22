const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '..', 'data', 'database.json');

// Real Mongoose models
const UserModel = require('../models/User');
const ProductModel = require('../models/Product');
const OrderModel = require('../models/Order');

let isConnectedToMongo = false;

// In-memory / file-based fallback store
let fallbackData = {
  users: [],
  products: [],
  orders: []
};

function loadFallbackData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      fallbackData = JSON.parse(raw);
    } else {
      saveFallbackData();
    }
  } catch (err) {
    console.error('Lỗi khi đọc database.json:', err.message);
  }
}

function saveFallbackData() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(fallbackData, null, 2), 'utf8');
  } catch (err) {
    console.error('Lỗi khi ghi database.json:', err.message);
  }
}

// Generate MongoDB-like 24 hex char ID
function generateId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

class QueryBuilder {
  constructor(results, collectionName, isSingle = false) {
    this.results = results.map(r => new DocumentWrapper(JSON.parse(JSON.stringify(r)), collectionName));
    this.collectionName = collectionName;
    this.isSingle = isSingle;
  }

  populate(pathField, selectFields) {
    if (pathField === 'seller') {
      const userItems = fallbackData.users;
      this.results.forEach(doc => {
        const sellerId = typeof doc.seller === 'object' && doc.seller ? doc.seller._id || doc.seller : doc.seller;
        const found = userItems.find(u => (u._id || '').toString() === (sellerId || '').toString());
        if (found) {
          doc.seller = {
            _id: found._id,
            name: found.name,
            email: found.email,
            dongPhu: found.dongPhu || 'Thanh Vân Động Phủ'
          };
        }
      });
    } else if (pathField === 'buyer') {
      const userItems = fallbackData.users;
      this.results.forEach(doc => {
        const buyerId = typeof doc.buyer === 'object' && doc.buyer ? doc.buyer._id || doc.buyer : doc.buyer;
        const found = userItems.find(u => (u._id || '').toString() === (buyerId || '').toString());
        if (found) {
          doc.buyer = {
            _id: found._id,
            name: found.name,
            email: found.email,
            dongPhu: found.dongPhu || 'Thanh Vân Động Phủ'
          };
        }
      });
    } else if (pathField === 'wishlist') {
      const prodItems = fallbackData.products;
      this.results.forEach(doc => {
        if (Array.isArray(doc.wishlist)) {
          doc.wishlist = doc.wishlist.map(pId => {
            const actualId = (pId && pId._id) ? pId._id : pId;
            return prodItems.find(p => (p._id || '').toString() === (actualId || '').toString()) || pId;
          });
        }
      });
    } else if (pathField === 'cart.product') {
      const prodItems = fallbackData.products;
      this.results.forEach(doc => {
        if (Array.isArray(doc.cart)) {
          doc.cart.forEach(item => {
            const actualId = (item.product && item.product._id) ? item.product._id : item.product;
            const p = prodItems.find(prod => (prod._id || '').toString() === (actualId || '').toString());
            if (p) item.product = p;
          });
        }
      });
    }
    return this;
  }

  sort(sortOptions) {
    if (sortOptions && typeof sortOptions === 'object') {
      const entries = Object.entries(sortOptions);
      if (entries.length > 0) {
        this.results.sort((a, b) => {
          for (const [key, dir] of entries) {
            if (a[key] < b[key]) return dir === -1 ? 1 : -1;
            if (a[key] > b[key]) return dir === -1 ? -1 : 1;
          }
          return 0;
        });
      }
    }
    return this;
  }

  skip(n) {
    this.results = this.results.slice(n);
    return this;
  }

  limit(n) {
    this.results = this.results.slice(0, n);
    return this;
  }

  then(resolve, reject) {
    try {
      if (this.isSingle) {
        resolve(this.results.length > 0 ? this.results[0] : null);
      } else {
        resolve(this.results);
      }
    } catch (err) {
      if (reject) reject(err);
      else throw err;
    }
  }

  catch(reject) {
    return this.then(undefined, reject);
  }
}

class DocumentWrapper {
  constructor(data, collectionName) {
    Object.assign(this, data);
    this._collectionName = collectionName;
  }

  async populate(pathField) {
    const qb = new QueryBuilder([this], this._collectionName, true);
    qb.populate(pathField);
    return this;
  }

  async save() {
    const sId = (this._id || '').toString();
    const items = fallbackData[this._collectionName];
    const index = items.findIndex(item => (item._id || '').toString() === sId);
    
    // clone plain data without private props
    const plain = { ...this };
    delete plain._collectionName;

    if (index >= 0) {
      plain.updatedAt = new Date().toISOString();
      items[index] = plain;
    } else {
      plain.createdAt = plain.createdAt || new Date().toISOString();
      plain.updatedAt = new Date().toISOString();
      items.push(plain);
    }
    saveFallbackData();
    return this;
  }
}

// Fallback Model wrapper
class FallbackModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get items() {
    return fallbackData[this.collectionName];
  }

  find(query = {}) {
    let results = this.items.filter(item => this._matches(item, query));
    return new QueryBuilder(results, this.collectionName, false);
  }

  findOne(query = {}) {
    let results = this.items.filter(item => this._matches(item, query));
    return new QueryBuilder(results.slice(0, 1), this.collectionName, true);
  }

  findById(id) {
    if (!id) return new QueryBuilder([], this.collectionName, true);
    const sId = id.toString();
    const item = this.items.filter(i => (i._id || '').toString() === sId);
    return new QueryBuilder(item, this.collectionName, true);
  }

  async create(docData) {
    const now = new Date().toISOString();
    const newDoc = {
      _id: generateId(),
      ...docData,
      createdAt: now,
      updatedAt: now
    };
    if (this.collectionName === 'users') {
      newDoc.wishlist = newDoc.wishlist || [];
      newDoc.cart = newDoc.cart || [];
      if (newDoc.linhThach === undefined) newDoc.linhThach = 1000;
    }
    this.items.push(newDoc);
    saveFallbackData();
    return new DocumentWrapper(JSON.parse(JSON.stringify(newDoc)), this.collectionName);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const sId = (id || '').toString();
    const index = this.items.findIndex(item => (item._id || '').toString() === sId);
    if (index === -1) return null;

    let target = this.items[index];
    if (update.$set) {
      Object.assign(target, update.$set);
    } else {
      Object.assign(target, update);
    }
    target.updatedAt = new Date().toISOString();
    saveFallbackData();
    return new DocumentWrapper(JSON.parse(JSON.stringify(target)), this.collectionName);
  }

  async findByIdAndDelete(id) {
    const sId = (id || '').toString();
    const index = this.items.findIndex(item => (item._id || '').toString() === sId);
    if (index === -1) return null;
    const removed = this.items.splice(index, 1)[0];
    saveFallbackData();
    return new DocumentWrapper(removed, this.collectionName);
  }

  async countDocuments(query = {}) {
    return this.items.filter(item => this._matches(item, query)).length;
  }

  _matches(item, query) {
    if (query.$or && Array.isArray(query.$or)) {
      if (!query.$or.some(subQuery => this._matches(item, subQuery))) return false;
    }
    for (const [key, val] of Object.entries(query)) {
      if (key === '$or') continue;
      if (key === '_id') {
        if (val && typeof val === 'object' && val.$in) {
          const ids = val.$in.map(v => (v && v._id ? v._id : v).toString());
          if (!ids.includes((item._id || '').toString())) return false;
        } else if ((item._id || '').toString() !== (val || '').toString()) {
          return false;
        }
      } else if (key === 'seller') {
        const itemSeller = (item.seller && item.seller._id) ? item.seller._id : item.seller;
        if ((itemSeller || '').toString() !== (val || '').toString()) return false;
      } else if (val && typeof val === 'object' && val.$in) {
        if (!val.$in.map(v => (v || '').toString()).includes((item[key] || '').toString())) return false;
      } else if (val && typeof val === 'object' && val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(item[key] || '')) return false;
      } else if (item[key] !== val) {
        return false;
      }
    }
    return true;
  }
}

const fallbackUser = new FallbackModel('users');
const fallbackProduct = new FallbackModel('products');
const fallbackOrder = new FallbackModel('orders');

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.log('🌿 [Vạn Bảo Các] MONGO_URI/MONGODB_URI chưa được cấu hình. Sử dụng Bộ Lưu Trữ Thần Bí (JSON Database) tự động.');
    loadFallbackData();
    isConnectedToMongo = false;
    return;
  }

  try {
    console.log('🌿 [Vạn Bảo Các] Đang liên kết linh mạch tới MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnectedToMongo = true;
    console.log('✨ [Vạn Bảo Các] Kết nối MongoDB Atlas thành công! Linh khí dồi dào.');
  } catch (err) {
    console.warn(`⚠️ [Vạn Bảo Các] Không thể kết nối MongoDB Atlas (${err.message}). Tự động kích hoạt Bộ Lưu Trữ Thần Bí (JSON Database) để đảm bảo hệ thống luôn hoạt động.`);
    loadFallbackData();
    isConnectedToMongo = false;
  }
}

// Proxies that delegate to Mongoose if connected, or fallback
const User = new Proxy(UserModel, {
  get(target, prop) {
    if (isConnectedToMongo) {
      const val = UserModel[prop];
      if (typeof val === 'function') return val.bind(UserModel);
      return val;
    }
    return fallbackUser[prop];
  }
});

const Product = new Proxy(ProductModel, {
  get(target, prop) {
    if (isConnectedToMongo) {
      const val = ProductModel[prop];
      if (typeof val === 'function') return val.bind(ProductModel);
      return val;
    }
    return fallbackProduct[prop];
  }
});

const Order = new Proxy(OrderModel, {
  get(target, prop) {
    if (isConnectedToMongo) {
      const val = OrderModel[prop];
      if (typeof val === 'function') return val.bind(OrderModel);
      return val;
    }
    return fallbackOrder[prop];
  }
});

module.exports = {
  connectDB,
  isMongo: () => isConnectedToMongo,
  User,
  Product,
  Order,
  UserModel,
  ProductModel,
  OrderModel,
  getFallbackData: () => fallbackData,
  saveFallbackData
};
