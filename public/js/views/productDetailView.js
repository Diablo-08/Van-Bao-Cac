// Trang Chi Tiết Sản Phẩm (Product Detail Page - PDP)
async function renderProductDetailView(productId) {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-16 text-center text-emerald-400">
      <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
      <p class="mt-3 font-cinzel text-sm">Đang mở phong ấn chi tiết bảo vật...</p>
    </div>
  `;

  try {
    const data = await window.api.getProduct(productId);
    const product = data.product;

    const gradeColors = {
      Hoang: { label: 'Hoàng Giai', badgeClass: 'grade-badge-Hoang', border: 'border-slate-500', glow: 'shadow-slate-500/20' },
      Huyen: { label: 'Huyền Giai', badgeClass: 'grade-badge-Huyen', border: 'border-cyan-500', glow: 'shadow-cyan-500/30' },
      Dia: { label: 'Địa Giai', badgeClass: 'grade-badge-Dia', border: 'border-purple-500', glow: 'shadow-purple-500/30' },
      Thien: { label: 'Thiên Giai (Chí Tôn)', badgeClass: 'grade-badge-Thien', border: 'border-amber-500', glow: 'shadow-amber-500/40' },
      Tien: { label: 'Thiên Giai (Chí Tôn)', badgeClass: 'grade-badge-Thien', border: 'border-amber-500', glow: 'shadow-amber-500/40' }
    };
    const grade = gradeColors[product.grade] || gradeColors.Hoang;

    const isOutOfStock = (product.stock || 0) <= 0;
    const isFavorited = (window.store.user && window.store.user.wishlist) 
      ? window.store.user.wishlist.some(wId => (wId._id || wId).toString() === product._id.toString())
      : false;

    const categoryNames = {
      'cong-phap': 'Công Pháp & Bí Tịch',
      'dan-duoc': 'Đan Dược & Linh Thảo',
      'phap-bao': 'Pháp Bảo & Binh Khí',
      'linh-vat': 'Bảo Khố Tạp Vật'
    };

    container.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center text-xs text-slate-400 mb-6 gap-2">
          <a href="#home" class="hover:text-emerald-400">Trang Chủ</a>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
          <a href="#category/${product.category}" class="hover:text-emerald-400">${categoryNames[product.category] || 'Danh Mục'}</a>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
          <span class="text-slate-100 font-medium line-clamp-1">${product.name}</span>
        </nav>

        <!-- PDP Grid -->
        <div class="glass-modal rounded-3xl p-6 sm:p-10 border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <!-- Bên Trái: Hình Ảnh Lớn Hào Quang -->
          <div class="relative flex flex-col items-center justify-center">
            <div class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 ${grade.border} shadow-2xl ${grade.glow} bg-slate-950 group">
              <img src="${product.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'}" 
                   alt="${product.name}" 
                   class="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                   onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'"/>
              
              <!-- Shimmer overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

              <!-- Phẩm Cấp Badge góc trên -->
              <div class="absolute top-4 left-4 z-10">
                <span class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${grade.badgeClass}">
                  ${grade.label}
                </span>
              </div>

              <!-- Nút Thích lớn góc trên phải -->
              <div class="absolute top-4 right-4 z-10">
                <button onclick="window.handleToggleWishlist('${product._id}', event)" 
                        id="pdp-wishlist-btn"
                        class="w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 hover:text-pink-500 hover:scale-110 flex items-center justify-center transition border border-slate-700 shadow-lg">
                  <i class="fa-solid fa-heart text-base ${isFavorited ? 'text-pink-500' : ''}"></i>
                </button>
              </div>

              ${isOutOfStock ? `
                <div class="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-10 pointer-events-none">
                  <span class="px-5 py-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-500 font-bold text-sm tracking-widest uppercase flex items-center gap-2 shadow-xl">
                    <i class="fa-solid fa-ban text-rose-400"></i> Hết Hàng
                  </span>
                </div>
              ` : ''}
            </div>

            <!-- Tình trạng tồn kho -->
            <div class="mt-4 flex items-center justify-between w-full px-2 text-xs">
              <div class="text-slate-400">
                Tồn Kho Tông Môn: 
                <span class="font-bold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}">
                  ${isOutOfStock ? '0 (Kho Rỗng)' : `${product.stock} bảo vật`}
                </span>
              </div>
              <div class="text-slate-400">
                Bảo hộ: <span class="text-amber-400">Khế ước Vạn Bảo Các</span>
              </div>
            </div>
          </div>

          <!-- Bên Phải: Chi Tiết & Tác Vụ Mua Hàng -->
          <div class="flex flex-col justify-between">
            <div>
              
              <!-- Phân Mục Của Bảo Vật & Nút Sửa Bảo Vật cho Admin/Seller -->
              <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400">
                  <i class="fa-solid fa-scroll text-emerald-400"></i>
                  <span>Phân Mục:</span>
                  <strong class="text-slate-100">${product.subCategory || 'Bảo Khố'}</strong>
                  ${product.subType ? `<span class="text-slate-400 text-[11px]">(${product.subType})</span>` : ''}
                </div>

                ${(window.store.user && (window.store.user.role === 'admin' || (product.seller && ((product.seller._id || product.seller).toString() === window.store.user._id.toString())))) ? `
                  <button onclick="window.openEditProductModal('${product._id}', '${encodeURIComponent(JSON.stringify(product))}')" 
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-semibold shadow-md transition cursor-pointer">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span>Tu Sửa Bảo Vật & Ảnh</span>
                  </button>
                ` : ''}
              </div>

              <!-- Tên Bảo Vật -->
              <h1 class="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-wide mb-2">
                ${product.name}
              </h1>

              <!-- Giá Bán Linh Thạch -->
              <div class="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/30 flex items-baseline space-x-3">
                <span class="text-xs text-amber-400 uppercase tracking-wider font-semibold">Đơn Giá:</span>
                <span class="text-3xl font-extrabold text-amber-300 font-cinzel">
                  ${(product.price || 0).toLocaleString('vi-VN')}
                </span>
                <span class="text-sm font-semibold text-amber-400">Linh Thạch</span>
              </div>

              <!-- Mô Tả Công Hiệu Chi Tiết (Theo đặc tả) -->
              <div class="mb-5">
                <h4 class="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <i class="fa-solid fa-sparkles text-emerald-400"></i>
                  <span>Mô Tả Công Hiệu:</span>
                </h4>
                <p class="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  ${product.description}
                </p>
              </div>

              <!-- Điển Cố / Lore Lai Lịch -->
              ${product.lore ? `
                <div class="mb-6">
                  <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <i class="fa-solid fa-scroll text-amber-400"></i>
                    <span>Điển Cố & Lai Lịch:</span>
                  </h4>
                  <p class="text-xs text-slate-400 italic leading-relaxed border-l-2 border-emerald-500/40 pl-3 py-1">
                    "${product.lore}"
                  </p>
                </div>
              ` : ''}

            </div>

            <!-- Khung Thao Tác Mua & Thêm Giỏ Hàng -->
            <div class="pt-6 border-t border-slate-800 space-y-4">
              
              <!-- Bộ Chọn Số Lượng -->
              ${!isOutOfStock ? `
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Số Lượng Thu Nạp:</span>
                  <div class="flex items-center rounded-xl bg-slate-950 border border-slate-700 overflow-hidden">
                    <button onclick="window.adjustPdpQty(-1, ${product.stock})" class="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition">
                      <i class="fa-solid fa-minus text-xs"></i>
                    </button>
                    <input type="number" 
                           id="pdp-qty-input" 
                           value="1" 
                           min="1" 
                           max="${product.stock}" 
                           class="w-14 text-center bg-transparent text-sm font-bold text-emerald-400 outline-none" />
                    <button onclick="window.adjustPdpQty(1, ${product.stock})" class="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition">
                      <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                  </div>
                </div>
              ` : ''}

              <!-- Nút Action: "Thêm vào Yêu Thích" & "Thêm vào Giỏ Hàng" -->
              <!-- (Yêu cầu đặc tả: Nút "🛒 Thêm vào Giỏ Hàng" tự động khóa/disable nếu kho hết hàng stock = 0) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <!-- Nút Yêu Thích -->
                <button onclick="window.handleToggleWishlist('${product._id}', event)" 
                        class="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/50 text-slate-200 hover:text-pink-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer">
                  <i class="fa-solid fa-heart ${isFavorited ? 'text-pink-500' : ''}"></i>
                  <span id="pdp-wish-text">${isFavorited ? 'Đã Lưu Tâm Niệm' : 'Thêm vào Yêu Thích'}</span>
                </button>

                <!-- Nút Thêm Vào Giỏ Hàng (Tự động khóa nếu hết hàng stock = 0) -->
                <button onclick="window.handleAddToCartPdp('${product._id}')" 
                        ${isOutOfStock ? 'disabled' : ''}
                        class="py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
                          isOutOfStock 
                            ? 'bg-slate-800 text-rose-400 cursor-not-allowed border border-slate-700 shadow-none' 
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 cursor-pointer'
                        }">
                  <i class="fa-solid ${isOutOfStock ? 'fa-ban text-rose-400' : 'fa-cart-shopping'}"></i>
                  <span>${isOutOfStock ? 'Hết Hàng' : 'Thêm vào Giỏ Hàng'}</span>
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    `;

  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-16 text-center">
        <div class="text-4xl mb-3">⚠️</div>
        <h3 class="font-bold text-rose-400">Không tìm thấy bảo vật này</h3>
        <p class="text-xs text-slate-400 mt-1 mb-4">${err.message}</p>
        <a href="#home" class="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs inline-block">
          Quay Lại Trang Chủ
        </a>
      </div>
    `;
  }
}

window.renderProductDetailView = renderProductDetailView;

window.adjustPdpQty = function(delta, maxStock) {
  const input = document.getElementById('pdp-qty-input');
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val = Math.max(1, Math.min(maxStock, val + delta));
  input.value = val;
};

window.handleAddToCartPdp = function(productId) {
  const input = document.getElementById('pdp-qty-input');
  const qty = input ? (parseInt(input.value, 10) || 1) : 1;
  window.handleAddToCart(productId, qty);
};
