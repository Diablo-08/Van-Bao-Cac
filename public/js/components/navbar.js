// Component Thanh Điều Hướng (Navbar Header)
function renderNavbar() {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const user = window.store.user;
  if (!user) {
    container.innerHTML = '';
    return;
  }

  const roleLabels = {
    admin: { label: 'Tông Chủ', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    seller: { label: 'Động Chủ', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    buyer: { label: 'Đạo Hữu', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
  };
  const roleInfo = roleLabels[user.role] || roleLabels.buyer;

  container.innerHTML = `
    <header class="sticky top-0 z-40 glass-nav border-b border-emerald-900/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <!-- Bên Trái: Logo Tu Tiên -->
        <div class="flex items-center space-x-6">
          <a href="#home" class="flex items-center space-x-3 group cursor-pointer">
            <span class="w-12 h-12 rounded-full overflow-hidden border border-emerald-400/40 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/20 shrink-0">
              <img src="/images/logo.png"
                   alt="Vạn Bảo Các"
                   class="w-full h-full object-cover scale-[1.2] group-hover:scale-[1.28] transition duration-300" />
            </span>
            <div>
              <div class="font-cinzel text-xl sm:text-2xl font-bold tracking-wider shimmer-text flex items-center gap-2">
                VẠN BẢO CÁC
              </div>
              <p class="text-[10px] text-emerald-400/80 uppercase tracking-widest font-medium">
                Thương Mại Điện Tử Tu Tiên
              </p>
            </div>
          </a>

          <!-- Quick Navigation Links -->
          <nav class="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800 text-sm">
            <a href="#home" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 transition">
              <i class="fa-solid fa-house-chimney mr-1.5 text-xs text-emerald-400"></i>Trang Chủ
            </a>
            <a href="#category/all" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 transition">
              <i class="fa-solid fa-boxes-stacked mr-1.5 text-xs text-emerald-400"></i>Kho Bảo Vật
            </a>
          </nav>
        </div>

        <!-- Bên Phải: Linh Thạch, Wishlist, Cart & Avatar -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          
          <!-- Số dư Linh Thạch Tức Thì + Nút Nạp Nhanh -->
          <div class="flex items-center bg-slate-900/90 border border-amber-500/40 rounded-full px-3 py-1.5 shadow-md shadow-amber-500/10">
            <span class="text-amber-400 text-sm mr-1.5 animate-pulse">💎</span>
            <span class="text-amber-200 font-bold text-xs sm:text-sm tracking-wide" id="nav-linh-thach">
              ${window.formatScientificOrLocale(user.linhThach || 0)}
            </span>
            <span class="text-[11px] text-amber-400/80 ml-1 hidden sm:inline">Linh Thạch</span>
            <button onclick="window.openRechargeModal()" title="Nạp Thêm Linh Thạch" class="ml-2 w-5 h-5 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black flex items-center justify-center text-xs font-bold transition">
              +
            </button>
          </div>

          <!-- Biểu tượng Trái Tim (❤️) - Wishlist -->
          <a href="#wishlist" class="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 hover:bg-pink-950/20 text-slate-300 hover:text-pink-400 transition group" title="Bảo vật tâm niệm (Yêu thích)">
            <i class="fa-solid fa-heart text-base group-hover:scale-110 transition"></i>
            <span id="nav-wishlist-badge" class="${window.store.wishlistCount > 0 ? '' : 'hidden'} absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-pink-500/50">
              ${window.store.wishlistCount}
            </span>
          </a>

          <!-- Biểu tượng Giỏ Hàng (🛒) - Cart -->
          <a href="#cart" class="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-300 hover:text-emerald-400 transition group" title="Càn khôn đại (Giỏ hàng)">
            <i class="fa-solid fa-cart-shopping text-base group-hover:scale-110 transition"></i>
            <span id="nav-cart-badge" class="${window.store.cartCount > 0 ? '' : 'hidden'} absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold flex items-center justify-center shadow-lg shadow-emerald-500/50">
              ${window.store.cartCount}
            </span>
          </a>

          <!-- Avatar & Tên Người Dùng -> Mở Sidebar Chi Tiết Cá Nhân -->
          <button onclick="window.openUserSidebar()" class="flex items-center space-x-2.5 pl-2 py-1 pr-3 rounded-full bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer">
            <div class="relative">
              <img src="${user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.name}" 
                   alt="${user.name}" 
                   class="w-8 h-8 rounded-full bg-slate-800 border border-emerald-400/50 object-cover" />
              <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
            </div>
            <div class="text-left hidden lg:block">
              <div class="text-xs font-semibold text-slate-200 line-clamp-1">${user.name}</div>
              <div class="text-[10px] text-emerald-400 font-medium">${roleInfo.label}</div>
            </div>
            <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 hidden sm:block"></i>
          </button>

        </div>

      </div>
    </header>
  `;
}

window.renderNavbar = renderNavbar;
