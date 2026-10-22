// Ứng Dụng Chính Vạn Bảo Các (Main Application Controller & Router)

// Khởi chạy khi tài liệu sẵn sàng
document.addEventListener('DOMContentLoaded', async () => {
  initCelestialParticles();
  await initAuthAndState();
  initRouter();

  // Đăng ký lắng nghe thay đổi store để đồng bộ Navbar
  window.store.subscribe(() => {
    window.renderNavbar();
  });
});

// Khởi tạo trạng thái xác thực từ Token
async function initAuthAndState() {
  const token = window.store.token;
  if (!token) {
    window.store.setUser(null);
    return;
  }

  try {
    const data = await window.api.getMe();
    window.store.setUser(data.user);
  } catch (err) {
    console.warn('Lệnh bài đã hết hạn, vui lòng xuất trình lại:', err.message);
    window.store.setToken(null);
    window.store.setUser(null);
  }
}

// Router dựa trên Hash URL
function initRouter() {
  window.addEventListener('hashchange', () => {
    handleRoute();
  });
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  const user = window.store.user;

  // YÊU CẦU ĐẶC TẢ: Khách chưa đăng nhập bắt buộc phải thấy trang Đăng nhập / Đăng ký
  if (!user) {
    window.renderNavbar();
    window.renderAuthView();
    return;
  }

  window.renderNavbar();

  // Match routes
  if (hash === '#category' || hash.startsWith('#category/')) {
    const catId = hash.startsWith('#category/') ? hash.replace('#category/', '').split('?')[0] : 'all';
    window.store.currentView = 'category';
    window.store.viewParams = { id: catId || 'all' };
    window.renderCategoryView(catId || 'all');
  } else if (hash.startsWith('#product/')) {
    const prodId = hash.replace('#product/', '').split('?')[0];
    window.store.currentView = 'product';
    window.store.viewParams = { id: prodId };
    window.renderProductDetailView(prodId);
  } else if (hash === '#cart') {
    window.store.currentView = 'cart';
    window.renderCartView();
  } else if (hash === '#wishlist') {
    window.store.currentView = 'wishlist';
    window.renderWishlistView();
  } else if (hash === '#admin') {
    window.store.currentView = 'admin';
    window.renderAdminView();
  } else if (hash === '#seller') {
    window.store.currentView = 'seller';
    window.renderSellerView();
  } else if (hash === '#orders') {
    window.store.currentView = 'orders';
    window.renderOrdersView();
  } else if (hash === '#inventory' || hash === '#kho-do') {
    window.store.currentView = 'inventory';
    window.renderInventoryView();
  } else if (hash === '#auth') {
    // Nếu đã đăng nhập mà vào #auth thì chuyển về #home
    window.location.hash = '#home';
  } else {
    // Mặc định là #home
    window.store.currentView = 'home';
    window.renderHomeView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.renderView = handleRoute;

// Navigation Helpers
window.navigateToCategory = function(catId) {
  const targetHash = `#category/${catId}`;
  if (window.location.hash === targetHash) {
    handleRoute();
  } else {
    window.location.hash = targetHash;
  }
};

window.navigateToProduct = function(prodId) {
  window.location.hash = `#product/${prodId}`;
};

// Global Add To Cart Handler
window.handleAddToCart = async function(productId, quantity = 1, event = null) {
  if (event) event.stopPropagation();

  if (!window.store.user) {
    window.location.hash = '#auth';
    return;
  }

  try {
    const data = await window.api.addToCart(productId, quantity);
    window.store.updateCartCount(data.cartCount);
    window.showToast(data.message, 'success');
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

// Global Toggle Wishlist Handler
window.handleToggleWishlist = async function(productId, event = null) {
  if (event) event.stopPropagation();

  if (!window.store.user) {
    window.location.hash = '#auth';
    return;
  }

  try {
    const data = await window.api.toggleWishlist(productId);
    
    // Cập nhật mảng wishlist trong store user
    if (!window.store.user.wishlist) window.store.user.wishlist = [];
    const index = window.store.user.wishlist.findIndex(id => (id._id || id).toString() === productId.toString());
    if (data.isAdded && index === -1) {
      window.store.user.wishlist.push(productId);
    } else if (!data.isAdded && index >= 0) {
      window.store.user.wishlist.splice(index, 1);
    }

    window.store.updateWishlistCount(data.wishlistCount);
    window.showToast(data.message, data.isAdded ? 'success' : 'info');

    // Cập nhật lại view hiện tại nếu đang ở wishlist
    if (window.store.currentView === 'wishlist') {
      window.renderWishlistView();
    } else {
      // Toggle màu trái tim trên UI
      const hearts = document.querySelectorAll(`button[onclick*="${productId}"] i.fa-heart`);
      hearts.forEach(h => {
        if (data.isAdded) h.classList.add('text-pink-500');
        else h.classList.remove('text-pink-500');
      });
      const pdpText = document.getElementById('pdp-wish-text');
      if (pdpText) {
        pdpText.textContent = data.isAdded ? 'Đã Lưu Tâm Niệm' : 'Thêm vào Yêu Thích';
      }
    }
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

// Global Logout Handler
window.handleLogout = async function() {
  if (!confirm('Đạo hữu có chắc muốn bế quan xuất trần (Đăng xuất)?')) return;
  try {
    await window.api.logout();
  } catch (e) {}

  window.store.setToken(null);
  window.store.setUser(null);
  window.closeUserSidebar();
  window.showToast('Đã bế quan xuất trần.', 'info');
  window.location.hash = '#auth';
};

// Toast Notification System
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-emerald-500/20',
    error: 'bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-rose-500/20',
    info: 'bg-slate-900/95 border-amber-500/60 text-amber-300 shadow-amber-500/10'
  };
  const typeIcons = {
    success: '<i class="fa-solid fa-circle-check text-emerald-400"></i>',
    error: '<i class="fa-solid fa-triangle-exclamation text-rose-400"></i>',
    info: '<i class="fa-solid fa-bolt text-amber-400"></i>'
  };

  toast.className = `p-3.5 rounded-2xl border text-xs font-semibold backdrop-blur-md shadow-xl flex items-center gap-3 transition duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <span class="text-base">${typeIcons[type] || typeIcons.info}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Celestial Particle Effect for Cultivation Atmosphere
function initCelestialParticles() {
  const canvas = document.getElementById('celestial-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.2, // rising celestial motes
      opacity: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.4 ? 'rgba(16, 185, 129,' : 'rgba(245, 158, 11,'
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < 0) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color === 'rgba(16, 185, 129,' ? '#10b981' : '#f59e0b';
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}
