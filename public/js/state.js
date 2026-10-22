// Quản lý Trạng Thái Toàn Cục Vạn Bảo Các
class Store {
  constructor() {
    this.token = localStorage.getItem('vbc_token') || null;
    this.user = null;
    this.categories = [];
    this.cartCount = 0;
    this.wishlistCount = 0;
    this.currentView = 'home';
    this.viewParams = {};
    this.listeners = [];
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('vbc_token', token);
    } else {
      localStorage.removeItem('vbc_token');
    }
    this.notify();
  }

  setUser(user) {
    this.user = user;
    if (user) {
      this.cartCount = user.cartCount || 0;
      this.wishlistCount = user.wishlistCount || 0;
    } else {
      this.cartCount = 0;
      this.wishlistCount = 0;
    }
    this.notify();
  }

  updateLinhThach(amount) {
    if (this.user) {
      this.user.linhThach = amount;
      this.notify();
    }
  }

  updateCartCount(count) {
    this.cartCount = count;
    if (this.user) this.user.cartCount = count;
    this.notify();
  }

  updateWishlistCount(count) {
    this.wishlistCount = count;
    if (this.user) this.user.wishlistCount = count;
    this.notify();
  }

  setView(view, params = {}) {
    this.currentView = view;
    this.viewParams = params;
    window.location.hash = this._buildHash(view, params);
    this.notify();
  }

  _buildHash(view, params) {
    if (view === 'category' && params.id) return `#category/${params.id}`;
    if (view === 'product' && params.id) return `#product/${params.id}`;
    return `#${view}`;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }
}

window.store = new Store();

// Hàm định dạng số Linh Thạch / Doanh Thu: Khi vượt quá 10 triệu dùng ký hiệu khoa học
window.formatScientificOrLocale = function(val) {
  const num = Number(val) || 0;
  if (num > 10000000) {
    return num.toExponential(2);
  }
  return num.toLocaleString('vi-VN');
};
