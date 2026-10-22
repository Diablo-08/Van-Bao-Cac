// Giao diện kết nối API tới Vạn Bảo Các Backend
const api = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (window.store && window.store.token) {
      headers['Authorization'] = `Bearer ${window.store.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If 401 Unauthorized, reset token & user if not already in auth
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
          if (window.store && window.store.token) {
            window.store.setToken(null);
            window.store.setUser(null);
            window.store.setView('auth');
          }
        }
        const error = new Error(data.message || `Lỗi máy chủ (${response.status})`);
        error.data = data;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  // --- AUTH ---
  login(identifier, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, password })
    });
  },

  register(name, email, password, dongPhu) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, dongPhu })
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  logout() {
    return this.request('/auth/logout', { method: 'POST' });
  },

  // --- USER & LINH THẠCH ---
  recharge(amount, secretCode) {
    return this.request('/users/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount, secretCode })
    });
  },

  getWishlist() {
    return this.request('/users/wishlist');
  },

  toggleWishlist(productId) {
    return this.request('/users/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  // --- ADMIN ---
  createSeller(sellerData) {
    return this.request('/users/admin/create-seller', {
      method: 'POST',
      body: JSON.stringify(sellerData)
    });
  },

  getAdminSellers() {
    return this.request('/users/admin/sellers');
  },

  getAdminStats() {
    return this.request('/users/admin/stats');
  },

  // --- PRODUCTS ---
  getCategories() {
    return this.request('/products/categories');
  },

  getFeaturedByCategory() {
    return this.request('/products/featured-by-category');
  },

  getProducts(params = {}) {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.subCategory) qs.set('subCategory', params.subCategory);
    if (params.grade) qs.set('grade', params.grade);
    if (params.search) qs.set('search', params.search);
    if (params.sort) qs.set('sort', params.sort);
    if (params.limit) qs.set('limit', params.limit);
    return this.request(`/products?${qs.toString()}`);
  },

  getProduct(id) {
    return this.request(`/products/${id}`);
  },

  createProduct(data) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateProduct(id, data) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  getSellerProducts() {
    return this.request('/products/seller/my-products');
  },

  // --- CART ---
  getCart() {
    return this.request('/cart');
  },

  addToCart(productId, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  updateCart(productId, quantity) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity })
    });
  },

  removeFromCart(productId) {
    return this.request(`/cart/remove/${productId}`, {
      method: 'DELETE'
    });
  },

  clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE'
    });
  },

  // --- ORDERS & CHECKOUT ---
  checkout() {
    return this.request('/orders/checkout', {
      method: 'POST'
    });
  },

  getMyOrders() {
    return this.request('/orders/my-orders');
  },

  getSellerOrders() {
    return this.request('/orders/seller-orders');
  }
};

window.api = api;
